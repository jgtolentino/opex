import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Head from 'next/head'

export default function LoginPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/upload')
    }
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Login - OpEx Platform</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo/Branding */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">OpEx Platform</h2>
            <p className="text-gray-600">Operational Excellence Hub</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h3>
              <p className="text-gray-600">Sign in to access AI assistants and upload documents</p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-green-500 mt-1 mr-3"
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
                <div>
                  <h4 className="font-medium text-gray-900">AI Assistants</h4>
                  <p className="text-sm text-gray-600">OpEx & PH Tax AI-powered chat</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-blue-500 mt-1 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900">Document Upload</h4>
                  <p className="text-sm text-gray-600">Upload PDFs to RAG knowledge base</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-purple-500 mt-1 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900">Knowledge Base</h4>
                  <p className="text-sm text-gray-600">Access policies and workflows</p>
                </div>
              </div>
            </div>

            {/* Auth0 Login Button */}
            <a
              href="/api/auth/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign In with Auth0
            </a>

            <p className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <a
                href="/api/auth/login?screen_hint=signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </a>
            </p>
          </div>

          {/* Help */}
          <div className="text-center">
            <a href="/portal" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Portal
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
