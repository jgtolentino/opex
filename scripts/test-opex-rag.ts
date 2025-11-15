#!/usr/bin/env tsx
// ============================================================================
// test-opex-rag.ts
// Smoke test for OpEx RAG integration
// ============================================================================

import { askOpexAssistant, askPhTaxAssistant } from '../lib/opex/ragClient';

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

const tests: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<any>): Promise<void> {
  console.log(`\n🧪 ${name}`);
  const start = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - start;

    tests.push({
      name,
      success: true,
      duration,
      data: result,
    });

    console.log(`✅ PASS (${duration}ms)`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;

    tests.push({
      name,
      success: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
    });

    console.log(`❌ FAIL (${duration}ms)`);
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('OpEx RAG Integration - Smoke Test');
  console.log('='.repeat(80));

  // Test 1: OpEx Assistant - HR Onboarding
  await runTest('OpEx Assistant - HR Onboarding Question', async () => {
    const response = await askOpexAssistant({
      question: 'What are the steps for employee onboarding and who approves each step?',
      domain: 'hr',
      process: 'onboarding',
    });

    console.log(`   Question: ${response.metadata?.threadId ? 'Sent' : 'Failed'}`);
    console.log(`   Answer length: ${response.answer.length} chars`);
    console.log(`   Citations: ${response.citations.length}`);
    console.log(`   Response time: ${response.metadata.responseTimeMs}ms`);

    return response;
  });

  // Test 2: OpEx Assistant - Finance Expense
  await runTest('OpEx Assistant - Finance Expense Question', async () => {
    const response = await askOpexAssistant({
      question: 'How do I submit an expense report and what are the approval limits?',
      domain: 'finance',
      process: 'expense',
    });

    console.log(`   Answer length: ${response.answer.length} chars`);
    console.log(`   Citations: ${response.citations.length}`);
    console.log(`   Response time: ${response.metadata.responseTimeMs}ms`);

    return response;
  });

  // Test 3: PH Tax Assistant - 2550M Deadline
  await runTest('PH Tax Assistant - 2550M Deadline', async () => {
    const response = await askPhTaxAssistant({
      question: 'When is the deadline for filing BIR Form 2550M for January 2025?',
      domain: 'tax',
      process: 'month_end',
    });

    console.log(`   Answer length: ${response.answer.length} chars`);
    console.log(`   Citations: ${response.citations.length}`);
    console.log(`   Response time: ${response.metadata.responseTimeMs}ms`);

    return response;
  });

  // Test 4: OpEx Assistant - General Question
  await runTest('OpEx Assistant - General HR Question', async () => {
    const response = await askOpexAssistant({
      question: 'What is the company policy on remote work?',
      domain: 'hr',
    });

    console.log(`   Answer length: ${response.answer.length} chars`);
    console.log(`   Citations: ${response.citations.length}`);
    console.log(`   Response time: ${response.metadata.responseTimeMs}ms`);

    return response;
  });

  // Test 5: Domain-specific wrapper
  await runTest('OpEx Assistant - askHRQuestion wrapper', async () => {
    const { askHRQuestion } = await import('../lib/opex/ragClient');

    const response = await askHRQuestion(
      'What documents are needed for new hire paperwork?',
      'onboarding'
    );

    console.log(`   Answer length: ${response.answer.length} chars`);
    console.log(`   Citations: ${response.citations.length}`);
    console.log(`   Response time: ${response.metadata.responseTimeMs}ms`);

    return response;
  });

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('Test Summary');
  console.log('='.repeat(80));

  const passed = tests.filter((t) => t.success).length;
  const failed = tests.filter((t) => !t.success).length;
  const total = tests.length;

  console.log(`\nTotal: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Failed Tests:');
    tests
      .filter((t) => !t.success)
      .forEach((t) => {
        console.log(`   - ${t.name}`);
        console.log(`     Error: ${t.error}`);
      });
  }

  // Average response time
  const avgTime =
    tests.reduce((sum, t) => sum + t.duration, 0) / tests.length;
  console.log(`\nAverage Response Time: ${Math.round(avgTime)}ms`);

  console.log('\n' + '='.repeat(80));

  // Verification steps
  console.log('\n📋 Next Verification Steps:');
  console.log('1. Check query logs in Supabase:');
  console.log('   psql "$OPEX_POSTGRES_URL" -c "SELECT * FROM opex.rag_queries ORDER BY created_at DESC LIMIT 5;"');
  console.log('\n2. Check analytics:');
  console.log('   psql "$OPEX_POSTGRES_URL" -c "SELECT opex.get_rag_analytics(NULL, 1);"');
  console.log('\n3. Check popular questions:');
  console.log('   psql "$OPEX_POSTGRES_URL" -c "SELECT * FROM opex.get_popular_questions(NULL, 1, 5);"');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
