// ============================================================================
// rag-feedback/index.ts
// Supabase Edge Function - Collect user feedback and ratings for RAG queries
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'opex' },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface FeedbackRequest {
  queryId: string;
  rating: number; // 1-5
  feedback?: string;
  evaluationMetadata?: Record<string, any>;
}

interface FeedbackResponse {
  success: boolean;
  queryId: string;
  rating: number;
  message: string;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { queryId, rating, feedback, evaluationMetadata }: FeedbackRequest = await req.json();

    // Validate input
    if (!queryId || !rating) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          details: 'Both queryId and rating are required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid rating',
          details: 'Rating must be an integer between 1 and 5'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('📝 Processing feedback:', {
      queryId: queryId.substring(0, 8),
      rating,
      hasFeedback: !!feedback
    });

    // Update the query with rating and feedback
    const updateData: any = {
      rating,
      feedback: feedback || null,
    };

    // Merge evaluation metadata if provided
    if (evaluationMetadata) {
      updateData.evaluation_metadata = evaluationMetadata;
    }

    const { data, error } = await supabase
      .from('rag_queries')
      .update(updateData)
      .eq('id', queryId)
      .select('id, question, rating, feedback');

    if (error) {
      console.error('❌ Failed to save feedback:', {
        code: error.code,
        message: error.message,
        details: error.details
      });

      return new Response(
        JSON.stringify({
          error: 'Failed to save feedback',
          details: error.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No query found with ID:', queryId);
      return new Response(
        JSON.stringify({
          error: 'Query not found',
          details: `No query found with ID: ${queryId}`
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Feedback saved successfully:', {
      queryId: data[0].id,
      rating: data[0].rating,
      question: data[0].question.substring(0, 50)
    });

    const response: FeedbackResponse = {
      success: true,
      queryId: data[0].id,
      rating: data[0].rating,
      message: 'Feedback saved successfully'
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('💥 Feedback endpoint error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: (error as Error).message || 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
