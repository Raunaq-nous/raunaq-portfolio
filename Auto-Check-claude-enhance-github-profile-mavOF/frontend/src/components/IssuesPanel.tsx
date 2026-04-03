import { useState } from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react'
import { api } from '../services/api'

interface Issue {
  id: string
  title: string
  description: string
  severity: string
  category: string
  location: {
    slide_number: number
  }
  auto_fixable: boolean
  operation_id?: string
  confidence: number
  status: string
}

interface IssuesPanelProps {
  issues: Issue[]
  onRefresh: () => void
}

export default function IssuesPanel({ issues, onRefresh }: IssuesPanelProps) {
  const [filter, setFilter] = useState<string>('all')
  const [applying, setApplying] = useState<string | null>(null)

  const severityIcons = {
    critical: <XCircle className="w-5 h-5 text-red-500" />,
    high: <AlertCircle className="w-5 h-5 text-orange-500" />,
    medium: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    low: <Info className="w-5 h-5 text-blue-500" />,
    info: <Info className="w-5 h-5 text-gray-500" />,
  }

  const severityColors = {
    critical: 'bg-red-50 border-red-200',
    high: 'bg-orange-50 border-orange-200',
    medium: 'bg-yellow-50 border-yellow-200',
    low: 'bg-blue-50 border-blue-200',
    info: 'bg-gray-50 border-gray-200',
  }

  const filteredIssues = filter === 'all'
    ? issues
    : issues.filter(i => i.severity === filter)

  const handleApplyFix = async (issue: Issue) => {
    if (!issue.operation_id) return

    setApplying(issue.id)
    try {
      await api.applyOperation(issue.operation_id)
      await api.updateIssueStatus(issue.id, 'fixed')
      onRefresh()
    } catch (error) {
      console.error('Failed to apply fix:', error)
    } finally {
      setApplying(null)
    }
  }

  const handleDismiss = async (issue: Issue) => {
    try {
      await api.dismissIssue(issue.id)
      onRefresh()
    } catch (error) {
      console.error('Failed to dismiss issue:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-4 border-b">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Issues ({issues.length})</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto">
        {filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <CheckCircle className="w-16 h-16 mb-4 text-green-500" />
            <p className="text-lg font-medium">No issues found!</p>
            <p className="text-sm">Your deck looks great</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-4 rounded-lg border ${severityColors[issue.severity as keyof typeof severityColors]}`}
              >
                <div className="flex items-start gap-3">
                  {severityIcons[issue.severity as keyof typeof severityIcons]}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{issue.title}</h4>
                      <span className="text-xs px-2 py-0.5 bg-white rounded-full">
                        Slide {issue.location.slide_number}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span className="px-2 py-0.5 bg-white rounded">
                        {issue.category}
                      </span>
                      {issue.confidence < 1 && (
                        <span>
                          {Math.round(issue.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>

                    {issue.status === 'open' && (
                      <div className="flex gap-2">
                        {issue.auto_fixable && issue.operation_id && (
                          <button
                            onClick={() => handleApplyFix(issue)}
                            disabled={applying === issue.id}
                            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            {applying === issue.id ? 'Applying...' : 'Apply Fix'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(issue)}
                          className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}

                    {issue.status === 'fixed' && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Fixed
                      </div>
                    )}
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
