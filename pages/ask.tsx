import Head from 'next/head'

import OpExChat from '@/components/OpExChat'

export default function AskPage() {
  return (
    <>
      <Head>
        <title>Ask OpEx Assistant</title>
        <meta
          name="description"
          content="AI-powered assistant for OpEx policies, processes, and workflows"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Ask OpEx Assistant</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get instant answers about policies, processes, and workflows from our
              AI-powered knowledge base
            </p>
          </div>

          {/* Chat Interface */}
          <OpExChat assistant="opex" domain="hr" />

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Quick Shortcuts
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• "What is the employee onboarding process?"</li>
                <li>• "How do I submit an expense report?"</li>
                <li>• "What are our remote work policies?"</li>
                <li>• "Explain the performance review process"</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Need Tax Help?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Switch to our PH Tax Assistant for BIR compliance, tax deadlines, and month-end
                closing questions.
              </p>
              <a
                href="/ask-tax"
                className="inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Switch to Tax Assistant →
              </a>
            </div>
          </div>

          {/* Knowledge Base Link */}
          <div className="mt-8 text-center">
            <a
              href="/portal"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Back to OpEx Portal
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
