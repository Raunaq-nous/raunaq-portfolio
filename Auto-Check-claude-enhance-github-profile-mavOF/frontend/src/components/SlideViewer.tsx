import { FileText } from 'lucide-react'

interface SlideViewerProps {
  deckId: string
}

export default function SlideViewer({ deckId }: SlideViewerProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-2xl">
        <FileText className="w-24 h-24 mx-auto mb-6 text-gray-400" />
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">
          Slide Preview
        </h3>
        <p className="text-gray-500 mb-6">
          Slide previews will be rendered here. This would show the current slide
          with highlighted issues and change previews.
        </p>
        <div className="bg-gray-50 rounded p-8 border-2 border-dashed border-gray-300">
          <p className="text-sm text-gray-400">
            In production, this would render slides using libraries like
            react-pdf or custom PPTX renderers with issue overlays.
          </p>
        </div>
      </div>
    </div>
  )
}
