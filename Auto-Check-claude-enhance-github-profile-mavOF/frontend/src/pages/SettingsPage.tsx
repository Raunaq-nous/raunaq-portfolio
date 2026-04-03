import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings, Check, AlertCircle, Zap, Server } from 'lucide-react'
import { api } from '../services/api'

interface Model {
  id: string
  name: string
  provider: string
  is_open_source: boolean
  context_window: number
  cost_per_1k_tokens?: number
  requires_api_key: boolean
  recommended: boolean
  model_id: string
}

interface TaskModels {
  models: Model[]
}

export default function SettingsPage() {
  const [activeTask, setActiveTask] = useState<string>('grammar_check')
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [preferOpenSource, setPreferOpenSource] = useState<boolean>(false)

  const queryClient = useQueryClient()

  // Fetch tasks
  const { data: tasksData } = useQuery({
    queryKey: ['model-tasks'],
    queryFn: () => api.getModelTasks()
  })

  // Fetch models for active task
  const { data: modelsData } = useQuery({
    queryKey: ['task-models', activeTask, preferOpenSource],
    queryFn: () => api.getModelsForTask(activeTask, preferOpenSource),
    enabled: !!activeTask
  })

  // Fetch current selections
  const { data: selectionsData } = useQuery({
    queryKey: ['model-selections'],
    queryFn: () => api.getModelSelections()
  })

  // Select model mutation
  const selectModelMutation = useMutation({
    mutationFn: (data: { task: string, modelId: string, apiKey?: string }) =>
      api.selectModel(data.task, data.modelId, data.apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-selections'] })
    }
  })

  // Test model mutation
  const testModelMutation = useMutation({
    mutationFn: (data: { task: string, modelId?: string }) =>
      api.testModel(data.task, data.modelId)
  })

  const handleSelectModel = async (modelId: string, requiresApiKey: boolean, provider: string) => {
    const apiKey = requiresApiKey ? apiKeys[provider] : undefined

    if (requiresApiKey && !apiKey) {
      alert(`Please enter API key for ${provider}`)
      return
    }

    try {
      await selectModelMutation.mutateAsync({
        task: activeTask,
        modelId,
        apiKey
      })
      alert('Model selected successfully!')
    } catch (error) {
      alert('Failed to select model')
    }
  }

  const handleTestModel = async (modelId: string) => {
    try {
      const result = await testModelMutation.mutateAsync({
        task: activeTask,
        modelId
      })

      if (result.success) {
        alert('Model test successful!')
      } else {
        alert(`Model test failed: ${result.message}`)
      }
    } catch (error) {
      alert('Failed to test model')
    }
  }

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }))
  }

  const toggleShowApiKey = (provider: string) => {
    setShowApiKeys(prev => ({ ...prev, [provider]: !prev[provider] }))
  }

  const getCurrentSelection = () => {
    if (!selectionsData?.selections) return null
    return selectionsData.selections[activeTask]
  }

  const currentSelection = getCurrentSelection()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Model Configuration</h1>
              <p className="text-sm text-gray-600">
                Choose between open-source and paid models for each task
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-100px)]">
        {/* Left: Tasks */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold text-gray-700 mb-4">AI Tasks</h2>

            {/* Preference Toggle */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferOpenSource}
                  onChange={(e) => setPreferOpenSource(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">
                  Open source only
                </span>
              </label>
            </div>

            <div className="space-y-2">
              {tasksData?.tasks?.map((task: any) => (
                <button
                  key={task.id}
                  onClick={() => setActiveTask(task.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTask === task.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm">{task.name}</div>
                  {currentSelection?.model_id && activeTask === task.id && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Configured
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Models */}
        <div className="flex-1 overflow-y-auto p-6">
          {modelsData?.task && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {modelsData.task.replace('_', ' ').toUpperCase()}
                </h2>
                <p className="text-gray-600">
                  Select an AI model for this task. Open-source models run locally (requires Ollama) or use free APIs. Paid models require API keys.
                </p>

                {currentSelection && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">
                        Currently using: {currentSelection.model_id}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Models Grid */}
              <div className="space-y-4">
                {modelsData?.models?.map((model: Model) => (
                  <div
                    key={model.id}
                    className={`p-4 border rounded-lg ${
                      model.recommended
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {model.name}
                          </h3>
                          {model.recommended && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Recommended
                            </span>
                          )}
                          {model.is_open_source && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              Open Source
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Server className="w-4 h-4" />
                            {model.provider}
                          </div>
                          <div>
                            Context: {model.context_window.toLocaleString()} tokens
                          </div>
                          {model.cost_per_1k_tokens && (
                            <div>
                              ${model.cost_per_1k_tokens}/1K tokens
                            </div>
                          )}
                        </div>

                        {/* API Key Input */}
                        {model.requires_api_key && (
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {model.provider} API Key
                            </label>
                            <div className="flex gap-2">
                              <input
                                type={showApiKeys[model.provider] ? 'text' : 'password'}
                                placeholder="Enter API key..."
                                value={apiKeys[model.provider] || ''}
                                onChange={(e) => handleApiKeyChange(model.provider, e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => toggleShowApiKey(model.provider)}
                                className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                              >
                                {showApiKeys[model.provider] ? 'Hide' : 'Show'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        <button
                          onClick={() => handleSelectModel(model.id, model.requires_api_key, model.provider)}
                          disabled={selectModelMutation.isPending}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {selectModelMutation.isPending ? 'Selecting...' : 'Select'}
                        </button>
                        <button
                          onClick={() => handleTestModel(model.id)}
                          disabled={testModelMutation.isPending}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {testModelMutation.isPending ? 'Testing...' : 'Test'}
                        </button>
                      </div>
                    </div>

                    {/* Installation hint for open source */}
                    {model.is_open_source && model.provider === 'ollama' && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5" />
                          <div>
                            <strong>Note:</strong> Requires Ollama installed.
                            <br />
                            Run: <code className="bg-yellow-100 px-1 rounded">ollama pull {model.model_id}</code>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
