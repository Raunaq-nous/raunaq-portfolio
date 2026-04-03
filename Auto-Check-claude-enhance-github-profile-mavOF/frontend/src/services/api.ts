import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {
  // Decks
  async uploadDeck(file: File, autoAnalyze = true) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await client.post(
      `/api/decks/upload?auto_analyze=${autoAnalyze}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    return response.data
  },

  async getDeck(deckId: string) {
    const response = await client.get(`/api/decks/${deckId}`)
    return response.data
  },

  async getDeckStatus(deckId: string) {
    const response = await client.get(`/api/decks/${deckId}/status`)
    return response.data
  },

  async analyzeDeck(deckId: string) {
    const response = await client.post(`/api/decks/${deckId}/analyze`)
    return response.data
  },

  // Issues
  async getIssues(deckId: string, filters?: any) {
    const response = await client.get(`/api/issues/${deckId}`, { params: filters })
    return response.data
  },

  async getIssue(issueId: string) {
    const response = await client.get(`/api/issues/detail/${issueId}`)
    return response.data
  },

  async updateIssueStatus(issueId: string, status: string) {
    const response = await client.patch(`/api/issues/${issueId}/status?status=${status}`)
    return response.data
  },

  async dismissIssue(issueId: string, reason?: string) {
    const response = await client.post(`/api/issues/${issueId}/dismiss`, { reason })
    return response.data
  },

  // Operations
  async getOperations(deckId: string, filters?: any) {
    const response = await client.get(`/api/operations/${deckId}`, { params: filters })
    return response.data
  },

  async applyOperation(operationId: string) {
    const response = await client.post(`/api/operations/apply/${operationId}`)
    return response.data
  },

  async applyBatch(operationIds: string[]) {
    const response = await client.post('/api/operations/apply-batch', { operation_ids: operationIds })
    return response.data
  },

  async undoOperation(operationId: string) {
    const response = await client.post(`/api/operations/undo/${operationId}`)
    return response.data
  },

  async redoOperation(operationId: string) {
    const response = await client.post(`/api/operations/redo/${operationId}`)
    return response.data
  },

  async getChangeHistory(deckId: string) {
    const response = await client.get(`/api/operations/changes/${deckId}`)
    return response.data
  },

  // Exports
  async exportPDF(deckId: string) {
    const response = await client.get(`/api/exports/${deckId}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  async exportJSON(deckId: string) {
    const response = await client.get(`/api/exports/${deckId}/json`, {
      responseType: 'blob',
    })
    return response.data
  },

  async exportDiff(deckId: string) {
    const response = await client.get(`/api/exports/${deckId}/diff`, {
      responseType: 'blob',
    })
    return response.data
  },

  async getExportSummary(deckId: string) {
    const response = await client.get(`/api/exports/${deckId}/summary`)
    return response.data
  },

  // RAG
  async ingestDocument(file: File, metadata: any) {
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value as string)
    })

    const response = await client.post('/api/rag/ingest', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async queryKnowledgeBase(query: string, topK = 5) {
    const response = await client.post('/api/rag/query', { query, top_k: topK })
    return response.data
  },

  async getRagSources() {
    const response = await client.get('/api/rag/sources')
    return response.data
  },

  // Models
  async getModelTasks() {
    const response = await client.get('/api/models/tasks')
    return response.data
  },

  async getModelsForTask(task: string, openSourceOnly = false) {
    const response = await client.get(`/api/models/models/${task}?open_source_only=${openSourceOnly}`)
    return response.data
  },

  async getAllModels(openSourceOnly = false) {
    const response = await client.get(`/api/models/models?open_source_only=${openSourceOnly}`)
    return response.data
  },

  async selectModel(task: string, modelId: string, apiKey?: string, baseUrl?: string) {
    const response = await client.post('/api/models/select', {
      task,
      model_id: modelId,
      api_key: apiKey,
      base_url: baseUrl
    })
    return response.data
  },

  async getModelSelections() {
    const response = await client.get('/api/models/selections')
    return response.data
  },

  async getSelectionForTask(task: string) {
    const response = await client.get(`/api/models/selections/${task}`)
    return response.data
  },

  async clearSelection(task: string) {
    const response = await client.delete(`/api/models/selections/${task}`)
    return response.data
  },

  async testModel(task: string, modelId?: string) {
    const response = await client.post('/api/models/test', {
      task,
      model_id: modelId
    })
    return response.data
  },

  async getModelProviders() {
    const response = await client.get('/api/models/providers')
    return response.data
  },

  async getModelRecommendations() {
    const response = await client.get('/api/models/recommendations')
    return response.data
  },
}
