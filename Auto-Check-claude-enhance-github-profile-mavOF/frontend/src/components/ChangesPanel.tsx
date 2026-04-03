import { useState } from 'react'
import { Undo, Redo, CheckCircle, Clock } from 'lucide-react'
import { api } from '../services/api'

interface Operation {
  id: string
  type: string
  rule_name: string
  category: string
  status: string
  target: {
    slide_number: number
  }
  changes: Array<{
    property: string
    before: any
    after: any
  }>
  confidence: number
}

interface ChangesPanelProps {
  operations: Operation[]
  onRefresh: () => void
}

export default function ChangesPanel({ operations, onRefresh }: ChangesPanelProps) {
  const [undoing, setUndoing] = useState<string | null>(null)
  const [redoing, setRedoing] = useState<string | null>(null)

  const handleUndo = async (operation: Operation) => {
    setUndoing(operation.id)
    try {
      await api.undoOperation(operation.id)
      onRefresh()
    } catch (error) {
      console.error('Failed to undo:', error)
    } finally {
      setUndoing(null)
    }
  }

  const handleRedo = async (operation: Operation) => {
    setRedoing(operation.id)
    try {
      await api.redoOperation(operation.id)
      onRefresh()
    } catch (error) {
      console.error('Failed to redo:', error)
    } finally {
      setRedoing(null)
    }
  }

  const statusColors = {
    pending: 'bg-gray-100 border-gray-300',
    applied: 'bg-green-50 border-green-200',
    undone: 'bg-orange-50 border-orange-200',
    failed: 'bg-red-50 border-red-200',
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-700">Change History</h3>
        <p className="text-sm text-gray-500 mt-1">
          {operations.filter(o => o.status === 'applied').length} applied
        </p>
      </div>

      {/* Changes List */}
      <div className="flex-1 overflow-y-auto">
        {operations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Clock className="w-16 h-16 mb-4 text-gray-400" />
            <p className="text-lg font-medium">No changes yet</p>
            <p className="text-sm">Apply fixes to see changes here</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {operations.map((operation) => (
              <div
                key={operation.id}
                className={`p-4 rounded-lg border ${statusColors[operation.status as keyof typeof statusColors]}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{operation.rule_name}</h4>
                      <span className="text-xs px-2 py-0.5 bg-white rounded-full">
                        Slide {operation.target.slide_number}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mb-2">
                      <span className="px-2 py-0.5 bg-white rounded">
                        {operation.category}
                      </span>
                      <span className="ml-2">•</span>
                      <span className="ml-2 capitalize">{operation.status}</span>
                    </div>

                    {operation.changes.length > 0 && (
                      <div className="text-xs space-y-1 mb-3">
                        {operation.changes.map((change, idx) => (
                          <div key={idx} className="bg-white rounded p-2">
                            <div className="font-medium text-gray-600 mb-1">
                              {change.property}:
                            </div>
                            <div className="text-red-600 line-through">
                              {String(change.before).substring(0, 50)}
                            </div>
                            <div className="text-green-600">
                              {String(change.after).substring(0, 50)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {operation.status === 'applied' && (
                        <button
                          onClick={() => handleUndo(operation)}
                          disabled={undoing === operation.id}
                          className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <Undo className="w-3 h-3" />
                          {undoing === operation.id ? 'Undoing...' : 'Undo'}
                        </button>
                      )}

                      {operation.status === 'undone' && (
                        <button
                          onClick={() => handleRedo(operation)}
                          disabled={redoing === operation.id}
                          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <Redo className="w-3 h-3" />
                          {redoing === operation.id ? 'Redoing...' : 'Redo'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
