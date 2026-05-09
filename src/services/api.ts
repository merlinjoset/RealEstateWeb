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

/**
 * Resolve the API base URL with the following precedence:
 *   1. `VITE_API_BASE_URL` env var (set on Render Static Site / Web Service)
 *      → e.g. "https://realestateapi-2k2n.onrender.com" or
 *             "https://realestateapi-2k2n.onrender.com/api" (both work)
 *   2. Fallback to "/api" for local dev (proxied by vite.config.ts to the
 *      .NET API on https://localhost:7080).
 *
 * Auto-appends "/api" if the env var was set without it — every controller
 * is mounted under [Route("api/...")] on the backend, so the prefix is
 * required regardless of how the operator typed the URL.
 */
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api')
  .replace(/\/$/, '') // strip trailing slash

const API_BASE_URL = /\/api(\/|$)/.test(rawBaseUrl)
  ? rawBaseUrl
  : `${rawBaseUrl}/api`

const api = axios.create({
  baseURL: API_BASE_URL,
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

/**
 * Public-facing seller submission payload — captures the submitter's name,
 * phone, and (optional) email so the API can fire the confirmation SMS/email.
 */
export interface PropertySubmission {
  title: string
  description: string
  totalPrice: number
  pricePerCent?: number
  address: string
  city: string
  district: string
  state: string
  pinCode: string
  areaInCents: number
  propertyType: string
  status: string
  features: string[]
  legalStatus?: string
  roadAccess: boolean
  submitterName: string
  submitterPhone: string
  submitterEmail?: string
}

export const propertiesApi = {
  getAll: (filters?: PropertyFilters) =>
    api.get<PaginatedResponse<Property>>('/properties', { params: filters }).then((r) => r.data),

  /** Public seller/dealer submission (auto-pending). */
  submit: (data: PropertySubmission) =>
    api.post<Property>('/properties', data).then((r) => r.data),

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

  getFavorites: () =>
    api.get<Property[]>('/properties/favorites').then((r) => r.data),

  /** Properties submitted by (or assigned to) the current user. */
  getMine: () =>
    api.get<Property[]>('/properties/mine').then((r) => r.data),
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<{ user: User; tokens: AuthTokens }>('/auth/login', credentials).then((r) => r.data),

  register: (data: RegisterData) =>
    api.post<{ user: User; tokens: AuthTokens }>('/auth/register', data).then((r) => r.data),

  logout: () => {
    const refreshToken = localStorage.getItem('refreshToken') ?? ''
    return api.post('/auth/logout', { refreshToken }).then((r) => r.data)
  },

  getMe: () =>
    api.get<User>('/auth/me').then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data),

  updateProfile: (data: {
    firstName: string; lastName: string; email: string; phone?: string | null
  }) =>
    api.put<User>('/auth/me', data).then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
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
  /** Submits an inquiry (used by the contact form, property pages,
   *  and document-request modals). Hits /api/inquiries on the backend. */
  send: (data: ContactForm) =>
    api.post('/inquiries', data).then((r) => r.data),
}

/* ------------------------ Admin: SMS Templates ------------------------ */

export interface SmsTemplate {
  id: number
  key: string
  label: string
  description: string | null
  body: string
  availableVars: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SmsTemplatePayload {
  label: string
  description?: string | null
  body: string
  availableVars?: string | null
  isActive: boolean
}

export interface TestSmsResult {
  sent: boolean
  provider: string
  renderedBody: string
  phone: string
  note: string | null
}

export const smsTemplatesApi = {
  getAll: () =>
    api.get<SmsTemplate[]>('/sms-templates').then((r) => r.data),

  update: (id: number, data: SmsTemplatePayload) =>
    api.put<SmsTemplate>(`/sms-templates/${id}`, data).then((r) => r.data),

  toggle: (id: number) =>
    api.patch<SmsTemplate>(`/sms-templates/${id}/toggle`).then((r) => r.data),

  /** Send a test SMS using realistic sample variables. */
  sendTest: (id: number, phone: string, vars?: Record<string, string>) =>
    api.post<TestSmsResult>(`/sms-templates/${id}/test`, { phone, vars }).then((r) => r.data),
}

/* ----------------------------- Admin: Users ----------------------------- */

export type AdminUserRole = 'Employee' | 'Seller' | 'Agent' | 'Admin'

export interface AdminUser {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string | null
  role: AdminUserRole
  isActive: boolean
  createdAt: string
  lastActiveAt: string | null
  propertiesCount: number
  inquiriesCount: number
}

export interface UserCounts {
  all: number; employee: number; seller: number; agent: number; admin: number
  active: number; inactive: number
}

export interface UserListResponse {
  items: AdminUser[]
  total: number
  counts: UserCounts
}

export interface UserQuery {
  search?: string
  role?: 'all' | 'employee' | 'seller' | 'agent' | 'admin'
  status?: 'all' | 'active' | 'inactive'
}

export interface CreateUserPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  city?: string | null
  role: AdminUserRole
  password?: string
}

export interface UpdateUserPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  city?: string | null
  role: AdminUserRole
  isActive: boolean
}

/* ------------------------- Testimonials ------------------------- */

export interface Testimonial {
  id: number
  name: string
  location: string
  propertyDetail: string | null
  rating: number
  excerpt: string
  thumbnail: string | null
  videoUrl: string | null
  duration: string | null
  isPublished: boolean
  order: number
  createdAt: string
}

export interface TestimonialPayload {
  name: string
  location: string
  propertyDetail?: string | null
  rating: number
  excerpt: string
  thumbnail?: string | null
  videoUrl?: string | null
  duration?: string | null
  isPublished: boolean
  order?: number
}

export const testimonialsApi = {
  /** Public list — only published */
  getPublished: () =>
    api.get<Testimonial[]>('/testimonials').then((r) => r.data),

  /** Admin list — includes drafts */
  getAll: () =>
    api.get<Testimonial[]>('/testimonials', { params: { all: true } }).then((r) => r.data),

  getById: (id: number) =>
    api.get<Testimonial>(`/testimonials/${id}`).then((r) => r.data),

  create: (data: TestimonialPayload) =>
    api.post<Testimonial>('/testimonials', data).then((r) => r.data),

  update: (id: number, data: TestimonialPayload) =>
    api.put<Testimonial>(`/testimonials/${id}`, data).then((r) => r.data),

  togglePublished: (id: number) =>
    api.patch<Testimonial>(`/testimonials/${id}/publish`).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/testimonials/${id}`).then((r) => r.data),
}

export const usersApi = {
  getAll: (q?: UserQuery) =>
    api.get<UserListResponse>('/users', { params: q }).then((r) => r.data),

  getById: (id: number) =>
    api.get<AdminUser>(`/users/${id}`).then((r) => r.data),

  create: (data: CreateUserPayload) =>
    api.post<AdminUser>('/users', data).then((r) => r.data),

  update: (id: number, data: UpdateUserPayload) =>
    api.put<AdminUser>(`/users/${id}`, data).then((r) => r.data),

  toggleStatus: (id: number) =>
    api.patch<AdminUser>(`/users/${id}/status`).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/users/${id}`).then((r) => r.data),
}

export default api
