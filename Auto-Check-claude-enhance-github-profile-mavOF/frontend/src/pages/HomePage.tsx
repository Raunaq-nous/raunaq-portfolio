import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, CheckCircle } from 'lucide-react'
import { api } from '../services/api'

export default function HomePage() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setError(null)

    try {
      const result = await api.uploadDeck(file)
      navigate(`/analyze/${result.deck_id}`)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [navigate])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploading
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Auto-Check
          </h1>
          <p className="text-xl text-gray-600">
            Intelligent Deck Analysis & Auto-Correction System
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div
            {...getRootProps()}
            className={`
              border-4 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-all duration-200
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center">
              <Upload className={`w-16 h-16 mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />

              {uploading ? (
                <>
                  <p className="text-xl font-semibold text-gray-700 mb-2">Uploading...</p>
                  <p className="text-gray-500">Please wait</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    {isDragActive ? 'Drop your deck here' : 'Upload your presentation deck'}
                  </p>
                  <p className="text-gray-500 mb-4">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports PPTX and PDF (max 100MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-semibold">Upload Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="font-semibold text-lg mb-2">Multi-Format Support</h3>
            <p className="text-gray-600 text-sm">
              Analyze PPTX and PDF presentations with advanced parsing
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="font-semibold text-lg mb-2">Comprehensive Checks</h3>
            <p className="text-gray-600 text-sm">
              Formatting, language, numeric, chart, and fact validation
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h3 className="font-semibold text-lg mb-2">Undo/Redo Support</h3>
            <p className="text-gray-600 text-sm">
              Full change management with per-change control
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
