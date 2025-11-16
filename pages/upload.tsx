import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UploadedFile {
  name: string
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

function UploadPage() {
  const { user } = useUser()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)

    for (const file of acceptedFiles) {
      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        status: 'uploading',
      }

      setFiles((prev) => [...prev, uploadedFile])

      try {
        // Upload to Supabase Edge Function
        const formData = new FormData()
        formData.append('file', file)
        formData.append('userId', user?.sub || 'anonymous')
        formData.append('userEmail', user?.email || '')

        const { data, error } = await supabase.functions.invoke('ingest-document', {
          body: formData,
        })

        if (error) throw error

        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name ? { ...f, status: 'completed' } : f
          )
        )
      } catch (error: any) {
        console.error('Upload error:', error)
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, status: 'error', error: error.message || 'Upload failed' }
              : f
          )
        )
      }
    }

    setIsUploading(false)
  }, [user])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <>
      <Head>
        <title>Upload Documents - OpEx Platform</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload Documents</h1>
            <p className="text-xl text-gray-600">
              Add PDFs, Word docs, and text files to the RAG knowledge base
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Logged in as <span className="font-medium">{user?.email}</span> •{' '}
              <a href="/api/auth/logout" className="text-blue-600 hover:text-blue-700">
                Logout
              </a>
            </p>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />

            <svg
              className={`mx-auto h-16 w-16 mb-4 ${
                isDragActive ? 'text-blue-500' : 'text-gray-400'
              }`}
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

            {isDragActive ? (
              <p className="text-lg text-blue-600 font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-700 font-medium mb-2">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, Word, TXT, MD (max 10MB per file)
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Files</h2>
              <div className="bg-white rounded-lg shadow divide-y">
                {files.map((file, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <svg
                        className="w-8 h-8 text-gray-400 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <div className="ml-4">
                      {file.status === 'uploading' && (
                        <div className="flex items-center text-blue-600">
                          <svg
                            className="animate-spin h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span className="text-sm">Uploading...</span>
                        </div>
                      )}

                      {file.status === 'processing' && (
                        <div className="flex items-center text-yellow-600">
                          <svg
                            className="animate-spin h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span className="text-sm">Processing...</span>
                        </div>
                      )}

                      {file.status === 'completed' && (
                        <div className="flex items-center text-green-600">
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm">Added to RAG</span>
                        </div>
                      )}

                      {file.status === 'error' && (
                        <div className="text-red-600">
                          <p className="text-sm font-medium">Error</p>
                          {file.error && <p className="text-xs">{file.error}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex justify-center space-x-4">
            <a
              href="/ask"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Ask OpEx Assistant
            </a>
            <a
              href="/portal"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Portal
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default withPageAuthRequired(UploadPage)
