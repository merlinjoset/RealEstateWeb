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

// The API origin without the "/api" suffix — used for resolving
// media (image) URLs, which the backend serves directly off the root
// (e.g. https://api.joseforland.com/media/...). Falls back to the
// current page origin in dev so the Vite proxy can intercept.
const MEDIA_ORIGIN = API_BASE_URL.replace(/\/api$/, '')

/**
 * Convert a `Property.Images[]` entry into a fully-qualified URL the
 * browser can fetch. Handles three shapes the DB might hold:
 *
 *   "/media/2026/05/foo.jpg"           → "{MEDIA_ORIGIN}/media/2026/05/foo.jpg"
 *   "https://api.joseforland.com/..."  → returned as-is (already absolute)
 *   "" / null / undefined              → empty string (caller should fallback)
 *
 * Keeps the DB origin-neutral — every environment (dev, demo, prod)
 * resolves its own image base from VITE_API_BASE_URL.
 */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('/')) return `${MEDIA_ORIGIN}${path}`
  return `${MEDIA_ORIGIN}/${path}`
}

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
  /** Optional admin-assigned serial / reference number. */
  serialNo?: string
  title: string
  description: string
  totalPrice: number
  pricePerCent?: number
  /** Optional discounted price (< totalPrice). Send 0 to clear on update. */
  discountPrice?: number
  address: string
  city: string
  district: string
  state: string
  pinCode: string
  areaInCents: number
  /** Optional total built/plot area in square feet (used for rentals). */
  areaInSqFt?: number
  propertyType: string
  status: string
  features: string[]
  /** Public /media URLs returned from uploadsApi.propertyImage. */
  images?: string[]
  legalStatus?: string
  roadAccess: boolean
  /** "Free" (zero brokerage) or "VideoPromotion" (2% brokerage). */
  marketingPlan?: 'Free' | 'VideoPromotion'
  /** Optional Google-Maps pin coordinates */
  latitude?: number
  longitude?: number
  submitterName: string
  submitterPhone: string
  submitterEmail?: string
}

/**
 * Shape accepted by PUT /properties/{id}. It's the regular property fields plus
 * the owner/seller contact, which the backend stores on the Submitter* columns
 * (the read DTO exposes them as submittedBy*). Sending null/undefined leaves a
 * field unchanged; sending "" clears it.
 */
export type PropertyUpdate = Partial<Property> & {
  submitterName?: string | null
  submitterPhone?: string | null
  submitterEmail?: string | null
}

/**
 * Backend returns enum strings in PascalCase ("OpenLand", "ForSale") but the
 * frontend's PropertyType / ListingStatus unions are snake_case. Normalise
 * once at the API boundary so every consumer below sees a consistent shape.
 */
function normaliseProperty<T extends { propertyType?: string; status?: string }>(p: T): T {
  const map: Record<string, string> = {
    OpenLand: 'open_land',
    LandWithBuilding: 'land_with_building',
    Agricultural: 'agricultural',
    Commercial: 'commercial',
    ResidentialPlot: 'residential_plot',
    ForSale: 'for_sale',
    ForRent: 'for_rent',
    Sold: 'sold',
  }
  return {
    ...p,
    propertyType: p.propertyType ? (map[p.propertyType] ?? p.propertyType.toLowerCase()) : p.propertyType,
    status: p.status ? (map[p.status] ?? p.status.toLowerCase()) : p.status,
  }
}

/**
 * Upload a single property image and get back the public /media/... URL
 * to store in Property.Images. Used by both the public Submit Property
 * form and the admin Add/Edit Property page.
 */
export const uploadsApi = {
  propertyImage: async (file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('file', file)
    const r = await api.post<{ url: string }>('/uploads/property-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return r.data
  },
}

export const propertiesApi = {
  getAll: (filters?: PropertyFilters) =>
    api.get<PaginatedResponse<Property>>('/properties', { params: filters })
       .then((r) => ({ ...r.data, data: r.data.data.map(normaliseProperty) })),

  /** Public seller/dealer submission (auto-pending). */
  submit: (data: PropertySubmission) =>
    api.post<Property>('/properties', data).then((r) => r.data),

  getById: (id: number) =>
    api.get<Property>(`/properties/${id}`).then((r) => normaliseProperty(r.data)),

  getFeatured: () =>
    api.get<Property[]>('/properties/featured').then((r) => r.data.map(normaliseProperty)),

  getRelated: (id: number) =>
    api.get<Property[]>(`/properties/${id}/related`).then((r) => r.data.map(normaliseProperty)),

  create: (data: Partial<Property>) =>
    api.post<Property>('/properties', data).then((r) => r.data),

  update: (id: number, data: PropertyUpdate) =>
    api.put<Property>(`/properties/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/properties/${id}`).then((r) => r.data),

  toggleFavorite: (id: number) =>
    api.post(`/properties/${id}/favorite`).then((r) => r.data),

  getFavorites: () =>
    api.get<Property[]>('/properties/favorites').then((r) => r.data),

  /** Approved-property counts grouped by city. Used to drive the home
   *  page "Browse by Location" tiles with real numbers, and to derive
   *  display labels that match what the filter will actually match. */
  getCityCounts: () =>
    api.get<{ city: string; count: number }[]>('/properties/city-counts').then((r) => r.data),

  /** Properties submitted by (or assigned to) the current user. */
  getMine: () =>
    api.get<Property[]>('/properties/mine').then((r) => r.data),

  /** Admin: pending-approval queue. */
  getPending: () =>
    api.get<Property[]>('/properties/pending').then((r) => r.data),

  /** Admin: approve or reject a pending property. */
  approve: (id: number, action: 'approve' | 'reject', reason?: string) =>
    api.post<Property>(`/properties/${id}/approve`, { action, reason }).then((r) => r.data),

  /** Admin: assign a pending property to an Employee/Agent for verification. */
  assignToVerify: (id: number, assignedToUserId: number) =>
    api.patch<Property>(`/properties/${id}/assign`, { assignedToUserId }).then((r) => r.data),

  /** Employee: pending properties assigned to me for verification. */
  getAssignedToVerify: () =>
    api.get<Property[]>('/properties/assigned-to-verify').then((r) => r.data),

  /**
   * Submit verification notes for a property. Allowed for the assigned
   * verifier and for any Admin. Admins are pinged via SMS on submission.
   */
  submitVerification: (id: number, notes: string) =>
    api.patch<Property>(`/properties/${id}/verification`, { notes }).then((r) => r.data),
}

/* ------------------- Admin inquiries (notifications feed) ------------------- */

export interface AdminInquiry {
  id: number
  name: string
  phone: string
  email?: string | null
  message: string
  preferredContact: string
  type: string
  isRead: boolean
  status: string
  notes?: string | null
  propertyId?: number | null
  propertyTitle?: string | null
  /** ID of the Employee/Agent the inquiry is assigned to (null = unassigned). */
  assignedToUserId?: number | null
  /** Pre-joined display name from the backend DTO. */
  assignedToName?: string | null
  assignedAt?: string | null
  lastUpdatedAt?: string | null
  createdAt: string
}

/** Server returns `{ data, total, page, pageSize }` from GET /api/inquiries. */
interface InquiriesEnvelope {
  data: AdminInquiry[]
  total: number
  page: number
  pageSize: number
}

export const inquiriesApi = {
  /** Admin: unread inquiries — used for the notification bell feed. */
  getUnread: () =>
    api.get<InquiriesEnvelope>('/inquiries', { params: { unreadOnly: true } })
      .then((r) => r.data.data),

  getAll: () =>
    api.get<InquiriesEnvelope>('/inquiries').then((r) => r.data.data),

  markRead: (id: number) =>
    api.patch(`/inquiries/${id}/read`).then((r) => r.data),

  /** Hand an inquiry off to an Employee / Agent / Admin for follow-up. */
  assign: (id: number, assignedToUserId: number) =>
    api.patch<AdminInquiry>(`/inquiries/${id}/assign`, { assignedToUserId }).then((r) => r.data),

  /** Employee: inquiries assigned to me. */
  getMine: () =>
    api.get<AdminInquiry[]>('/inquiries/mine').then((r) => r.data),

  /**
   * Update the status (and optionally the notes) of an inquiry. The backend
   * broadcasts an SMS to admins on every status change so they can track
   * what the assignee is doing.
   */
  update: (id: number, status: 'New' | 'Assigned' | 'InProgress' | 'Resolved' | 'Closed', notes?: string | null) =>
    api.patch<AdminInquiry>(`/inquiries/${id}/update`, { status, notes }).then((r) => r.data),
}

export const authApi = {
  /**
   * Sign-in: encrypts the password client-side with the server's RSA public
   * key and posts the ciphertext, so DevTools' Network tab can't reveal the
   * plaintext password. Falls back to plaintext if encryption fails (e.g.
   * older server without /auth/public-key).
   */
  login: async (credentials: LoginCredentials) => {
    const { encryptPassword } = await import('./crypto')
    let body: { email: string; password?: string; encryptedPassword?: string }
    try {
      body = {
        email: credentials.email,
        encryptedPassword: await encryptPassword(credentials.password),
      }
    } catch {
      // RSA encryption failed (e.g. old server, browser without WebCrypto) —
      // fall back to plaintext over HTTPS.
      body = credentials
    }
    return api.post<{ user: User; tokens: AuthTokens }>('/auth/login', body).then((r) => r.data)
  },

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

  /** Step 1 of the forgot-password flow — sends an OTP via SMS + email. */
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  /** Step 2 — consume the OTP and set a new password. */
  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post('/auth/reset-password', { email, otp, newPassword }).then((r) => r.data),
}

export const agentsApi = {
  getAll: () =>
    api.get<Agent[]>('/agents').then((r) => r.data),

  getById: (id: number) =>
    api.get<Agent>(`/agents/${id}`).then((r) => r.data),

  getProperties: (id: number) =>
    api.get<Property[]>(`/agents/${id}/properties`).then((r) => r.data),
}

/* -------------------- Maps: short-link resolver -------------------- */

export interface ResolveMapUrlResponse {
  latitude: number
  longitude: number
  resolvedUrl: string
}

export const mapsApi = {
  /**
   * Resolve a Google Maps URL (long or short) to lat/lng coordinates.
   * The backend follows the redirect chain on short links like
   * `maps.app.goo.gl/...` since the browser can't due to CORS.
   */
  resolve: (url: string) =>
    api.post<ResolveMapUrlResponse>('/maps/resolve', { url }).then((r) => r.data),
}

/* -------------------- Site-wide settings (Admin → Settings) -------------------- */

export interface SiteSettings {
  facebookUrl: string
  instagramUrl: string
  youtubeUrl: string
  websiteUrl: string
  updatedAt: string
}

export const settingsApi = {
  /** Public — Footer pulls social URLs from here. */
  getSite: () =>
    api.get<SiteSettings>('/settings/site').then((r) => r.data),

  /** Admin — Settings page writes here. Pass only fields you want to change. */
  updateSite: (data: Partial<Omit<SiteSettings, 'updatedAt'>>) =>
    api.put<SiteSettings>('/settings/site', data).then((r) => r.data),
}

/* -------------------- Traffic analytics (in-app dashboard) -------------------- */

export interface AnalyticsDailyCount { date: string; count: number }
export interface AnalyticsLabelCount { label: string; count: number }
export interface AnalyticsSummary {
  days: number
  totalViews: number
  uniqueVisitors: number
  viewsToday: number
  viewsPreviousPeriod: number
  daily: AnalyticsDailyCount[]
  topPages: AnalyticsLabelCount[]
  topReferrers: AnalyticsLabelCount[]
}

export const analyticsApi = {
  /** Fire-and-forget page-view beacon (public). Callers should .catch() noop. */
  track: (data: { path: string; referrer?: string; visitorId?: string }) =>
    api.post('/analytics/pageview', data).then((r) => r.data),

  /** Admin: aggregated traffic summary for the Traffic dashboard. */
  getSummary: (days = 30) =>
    api.get<AnalyticsSummary>('/analytics/summary', { params: { days } }).then((r) => r.data),
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

export type AdminUserRole = 'Employee' | 'Seller' | 'Agent' | 'Admin' | 'Buyer'

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
  all: number; employee: number; seller: number; agent: number; admin: number; buyer: number
  active: number; inactive: number
}

export interface UserListResponse {
  items: AdminUser[]
  total: number
  counts: UserCounts
}

export interface UserQuery {
  search?: string
  role?: 'all' | 'employee' | 'seller' | 'agent' | 'admin' | 'buyer'
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
