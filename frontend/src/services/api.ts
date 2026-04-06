import axios from 'axios'

const API_BASE_URL: string = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {