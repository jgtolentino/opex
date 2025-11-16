// lib/logAlert.example.ts
// Usage examples for the logAlert helper

import { logAlert } from './logAlert'

// ============================================================================
// Example 1: API Route Error Handling
// ============================================================================

export async function exampleApiRoute() {
  try {
    // ... your logic ...
    throw new Error('Database connection failed')
  } catch (err) {
    await logAlert({
      level: 'error',
      source: 'opex-api',
      text: 'Failed to run /api/do-something',
      context: {
        error: (err as Error).message,
        timestamp: new Date().toISOString()
      }
    })

    return { ok: false, error: 'Internal server error' }
  }
}

// ============================================================================
// Example 2: Background Job Warning
// ============================================================================

export async function exampleBackgroundJob() {
  const pageCount = 42
  const warningCount = 3

  await logAlert({
    level: 'warn',
    source: 'docusaurus-build',
    text: 'Docusaurus build completed with warnings',
    context: {
      pageCount,
      warningCount,
      environment: process.env.NODE_ENV
    }
  })
}

// ============================================================================
// Example 3: User Action Tracking (Info Level)
// ============================================================================

export async function exampleUserAction(userId: string, action: string) {
  await logAlert({
    level: 'info',
    source: 'opex-portal',
    text: `User performed action: ${action}`,
    context: {
      userId,
      action,
      timestamp: Date.now()
    }
  })
}

// ============================================================================
// Example 4: RAG Query Error with Detailed Context
// ============================================================================

export async function exampleRagError(
  queryId: string,
  question: string,
  error: Error
) {
  await logAlert({
    level: 'error',
    source: 'opex-rag',
    text: 'RAG query failed',
    context: {
      queryId,
      question: question.substring(0, 100), // Truncate long questions
      error: error.message,
      stack: error.stack?.substring(0, 500) // Truncate stack trace
    }
  })
}

// ============================================================================
// Example 5: Deployment Success Notification
// ============================================================================

export async function exampleDeploymentSuccess(deploymentId: string) {
  await logAlert({
    level: 'info',
    source: 'vercel-deploy',
    text: 'OpEx deployment successful',
    context: {
      deploymentId,
      environment: 'production',
      timestamp: new Date().toISOString()
    }
  })
}

// ============================================================================
// Example 6: Edge Function Integration (from Supabase)
// ============================================================================

// This would go in a Supabase Edge Function:
/*
import { logAlert } from './logAlert' // Adjust path as needed

export async function exampleEdgeFunction() {
  try {
    // ... edge function logic ...
  } catch (err) {
    await logAlert({
      level: 'error',
      source: 'supabase-edge',
      text: 'Edge function execution failed',
      context: {
        function: 'embedding-worker',
        error: (err as Error).message
      }
    })
  }
}
*/
