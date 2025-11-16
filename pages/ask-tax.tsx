import Head from 'next/head'
import OpExChat from '@/components/OpExChat'

export default function AskTaxPage() {
  return (
    <>
      <Head>
        <title>PH Tax Assistant</title>
        <meta
          name="description"
          content="AI-powered assistant for Philippine BIR compliance and tax filing"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">PH Tax Assistant</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get instant answers about BIR compliance, tax deadlines, and month-end closing
              procedures
            </p>
          </div>

          {/* Chat Interface */}
          <OpExChat assistant="ph-tax" domain="tax" />

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Tax Deadlines
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• "What are this month's BIR deadlines?"</li>
                <li>• "When is Form 1601-C due?"</li>
                <li>• "Quarterly filing schedule for 2550Q"</li>
              </ul>
            </div>

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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Compliance
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• "How to fill out Form 1702-RT?"</li>
                <li>• "Withholding tax computation guide"</li>
                <li>• "Documentary requirements for BIR"</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Month-End
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• "Month-end closing checklist"</li>
                <li>• "Agency-specific filing requirements"</li>
                <li>• "Reconciliation procedures"</li>
              </ul>
            </div>
          </div>

          {/* Back to OpEx */}
          <div className="mt-8 text-center">
            <a
              href="/ask"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mr-6"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Switch to OpEx Assistant
            </a>
            <a
              href="/portal"
              className="inline-flex items-center text-gray-600 hover:text-gray-700 font-medium"
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
              Back to Portal
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
