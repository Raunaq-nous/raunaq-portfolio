import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import SlideViewer from '../components/SlideViewer'
import IssuesPanel from '../components/IssuesPanel'
import ChangesPanel from '../components/ChangesPanel'
import { Clock, CheckCircle } from 'lucide-react'

export default function AnalysisPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const [activeTab, setActiveTab] = useState<'issues' | 'changes'>('issues')

  const { data: deck, refetch: refetchDeck } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => api.getDeck(deckId!),
    refetchInterval: 2000,
  })

  const { data: issuesData } = useQuery({
    queryKey: ['issues', deckId],
    queryFn: () => api.getIssues(deckId!),
    enabled: !!(deck?.status === 'ready'),
  })

  const { data: operationsData } = useQuery({
    queryKey: ['operations', deckId],
    queryFn: () => api.getOperations(deckId!),
    enabled: !!(deck?.status === 'ready'),
  })

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-xl text-gray-600">Loading deck...</p>
        </div>
      </div>
    )
  }

  const isAnalyzing = (deck as any)?.status === 'analyzing' || (deck as any)?.status === 'parsing'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{(deck as any).filename}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>{(deck as any).metadata.slide_count} slides</span>
                <span>•</span>
                <span className="flex items-center gap-2">
                  {isAnalyzing ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Analysis complete
                    </>
                  )}
                </span>
              </div>
            </div>
            {!isAnalyzing && issuesData && (
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{(issuesData as any).by_severity?.critical || 0}</div>
                  <div className="text-xs text-gray-600">Critical</div>
                </div>
                <div className="text-center px-4 py-2 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{(issuesData as any).by_severity?.high || 0}</div>
                  <div className="text-xs text-gray-600">High</div>
                </div>
                <div className="text-center px-4 py-2 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{(issuesData as any).by_severity?.medium || 0}</div>
                  <div className="text-xs text-gray-600">Medium</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex h-[calc(100vh-120px)]">
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold text-gray-700 mb-4">Slides</h2>
            <div className="space-y-2">
              {Array.from({ length: (deck as any).metadata.slide_count }).map((_, idx) => (
                <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="text-sm font-medium">Slide {idx + 1}</div>
                  {issuesData && (
                    <div className="text-xs text-gray-500 mt-1">
                      {(issuesData as any).issues.filter((i: any) => i.location.slide_number === idx + 1).length} issues
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 bg-gray-100 p-6 overflow-auto">
          <SlideViewer deckId={deckId!} />
        </div>
        <div className="w-96 bg-white border-l flex flex-col">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('issues')}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${activeTab === 'issues' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Issues ({(issuesData as any)?.total || 0})
            </button>
            <button
              onClick={() => setActiveTab('changes')}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${activeTab === 'changes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Changes ({(operationsData as any)?.total || 0})
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isAnalyzing ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
                  <p className="text-gray-600">Analyzing deck...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'issues' && issuesData && <IssuesPanel issues={(issuesData as any).issues} onRefresh={refetchDeck} />}
                {activeTab === 'changes' && operationsData && <ChangesPanel operations={(operationsData as any).operations} onRefresh={refetchDeck} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
