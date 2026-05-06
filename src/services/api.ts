import axios, { AxiosError } from 'axios'
import type {
  Property,
  PropertyFilters,
  PaginatedResponse,
  LoginCredentials,
  RegisterData,
  User,
  AuthTokens,
  ContactForm,
  Agent,
} from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const propertiesApi = {
  getAll: (filters?: PropertyFilters) =>
    api.get<PaginatedResponse<Property>>('/properties', { params: filters }).then((r) => r.data),

  getById: (id: number) =>
    api.get<Property>(`/properties/${id}`).then((r) => r.data),

  getFeatured: () =>
    api.get<Property[]>('/properties/featured').then((r) => r.data),

  getRelated: (id: number) =>
    api.get<Property[]>(`/properties/${id}/related`).then((r) => r.data),

  create: (data: Partial<Property>) =>
    api.post<Property>('/properties', data).then((r) => r.data),

  update: (id: number, data: Partial<Property>) =>
    api.put<Property>(`/properties/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/properties/${id}`).then((r) => r.data),

  toggleFavorite: (id: number) =>
    api.post(`/properties/${id}/favorite`).then((r) => r.data),
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<{ user: User; tokens: AuthTokens }>('/auth/login', credentials).then((r) => r.data),

  register: (data: RegisterData) =>
    api.post<{ user: User; tokens: AuthTokens }>('/auth/register', data).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  getMe: () =>
    api.get<User>('/auth/me').then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data),
}

export const agentsApi = {
  getAll: () =>
    api.get<Agent[]>('/agents').then((r) => r.data),

  getById: (id: number) =>
    api.get<Agent>(`/agents/${id}`).then((r) => r.data),

  getProperties: (id: number) =>
    api.get<Property[]>(`/agents/${id}/properties`).then((r) => r.data),
}

export const contactApi = {
  send: (data: ContactForm) =>
    api.post('/contact', data).then((r) => r.data),
}

export default api
