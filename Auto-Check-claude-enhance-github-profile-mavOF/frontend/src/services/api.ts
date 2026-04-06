import axios from 'axios'

const API_BASE_URL: string = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const api = {
  async uploadDeck(file: File, autoAnalyze = true) {
    const formData = new FormData()
    formData.append('file', file)
    return (await client.post(`/api/decks/upload?auto_analyze=${autoAnalyze}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data
  },
  async getDeck(deckId: string) {
    return (await client.get(`/api/decks/${deckId}`)).data
  },
  async getIssues(deckId: string, filters?: any) {
    return (await client.get(`/api/issues/${deckId}`, { params: filters })).data
  },
  async updateIssueStatus(issueId: string, status: string) {
    return (await client.patch(`/api/issues/${issueId}/status?status=${status}`)).data
  },
  async dismissIssue(issueId: string, reason?: string) {
    return (await client.post(`/api/issues/${issueId}/dismiss`, { reason })).data
  },
  async getOperations(deckId: string, filters?: any) {
    return (await client.get(`/api/operations/${deckId}`, { params: filters })).data
  },
  async applyOperation(operationId: string) {
    return (await client.post(`/api/operations/apply/${operationId}`)).data
  },
  async undoOperation(operationId: string) {
    return (await client.post(`/api/operations/undo/${operationId}`)).data
  },
  async redoOperation(operationId: string) {
    return (await client.post(`/api/operations/redo/${operationId}`)).data
  },
  async getModelTasks() {
    return (await client.get('/api/models/tasks')).data
  },
  async getModelsForTask(task: string, openSourceOnly = false) {
    return (await client.get(`/api/models/models/${task}?open_source_only=${openSourceOnly}`)).data
  },
  async getModelSelections() {
    return (await client.get('/api/models/selections')).data
  },
  async selectModel(task: string, modelId: string, apiKey?: string, baseUrl?: string) {
    return (await client.post('/api/models/select', { task, model_id: modelId, api_key: apiKey, base_url: baseUrl })).data
  },
  async testModel(task: string, modelId?: string) {
    return (await client.post('/api/models/test', { task, model_id: modelId })).data
  },
}
