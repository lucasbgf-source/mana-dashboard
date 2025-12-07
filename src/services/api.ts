import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = async (password: string) => {
  const response = await api.post('/admin/login', { password })
  return response.data
}

// Metrics
export const getOverviewMetrics = async () => {
  const response = await api.get('/admin/metrics/overview')
  return response.data
}

export const getUsersMetrics = async (days = 30) => {
  const response = await api.get(`/admin/metrics/users?days=${days}`)
  return response.data
}

export const getCommandsMetrics = async (days = 30) => {
  const response = await api.get(`/admin/metrics/commands?days=${days}`)
  return response.data
}

export const getEntriesMetrics = async (days = 30) => {
  const response = await api.get(`/admin/metrics/entries?days=${days}`)
  return response.data
}

export const getSystemMetrics = async () => {
  const response = await api.get('/admin/metrics/system')
  return response.data
}

// NOVO: Métricas de IA
export const getAIMetrics = async (days = 30) => {
  const response = await api.get(`/admin/metrics/ai?days=${days}`)
  return response.data
}

// Users
export const getUsers = async (page = 1, limit = 20, status?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status) params.append('status', status)
  const response = await api.get(`/admin/users?${params}`)
  return response.data
}

export const getUserDetail = async (userId: string) => {
  const response = await api.get(`/admin/users/${userId}`)
  return response.data
}

// Beta Codes
export const getBetaCodes = async (page = 1, limit = 50, status?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status) params.append('status', status)
  const response = await api.get(`/admin/beta-codes?${params}`)
  return response.data
}

export const generateBetaCodes = async (count = 10) => {
  const response = await api.post(`/admin/beta-codes/generate?count=${count}`)
  return response.data
}

export default api
