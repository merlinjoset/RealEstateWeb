export type PropertyType = 'open_land' | 'land_with_building' | 'agricultural' | 'commercial' | 'residential_plot'
export type ListingStatus = 'for_sale' | 'for_rent' | 'sold'

export type DocumentType =
  | 'ec'              // Encumbrance Certificate
  | 'patta'           // Patta document
  | 'chitta'          // Chitta extract
  | 'layout'          // Layout / survey plan
  | 'sale_deed'       // Original sale deed
  | 'tax_receipt'     // Property tax receipt
  | 'noc'             // No Objection Certificate
  | 'fmb'             // Field Measurement Book sketch
  | 'other'

export interface PropertyDocument {
  id: number
  propertyId: number
  type: DocumentType
  name: string         // user-friendly name e.g. "EC for last 13 years"
  fileName: string     // uploaded filename e.g. "ec-2010-2023.pdf"
  fileUrl: string      // public URL to download / view
  fileSize?: number    // bytes
  mimeType?: string    // application/pdf, image/jpeg…
  isPublic: boolean    // visible to buyers vs admin-only
  uploadedAt: string
}

export interface Property {
  id: number
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
  areaInSqFt?: number
  bedrooms?: number
  bathrooms?: number
  propertyType: PropertyType
  status: ListingStatus
  images: string[]
  features: string[]
  agentId?: number
  agent?: Agent
  createdAt: string
  updatedAt: string
  latitude?: number
  longitude?: number
  isFeatured: boolean
  isVerified: boolean
  roadAccess: boolean
  nearbyLandmarks?: string[]
  legalStatus?: string
  documents?: PropertyDocument[]
}

export interface Agent {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  whatsapp?: string
  avatar?: string
  bio?: string
  yearsOfExperience: number
  propertiesCount: number
  rating: number
}

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: 'buyer' | 'seller' | 'agent' | 'admin'
  avatar?: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  role: 'buyer' | 'seller'
}

export interface PropertyFilters {
  search?: string
  city?: string
  district?: string
  propertyType?: PropertyType
  status?: ListingStatus
  minPrice?: number
  maxPrice?: number
  minAreaCents?: number
  maxAreaCents?: number
  roadAccess?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'area_asc' | 'area_desc'
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ContactForm {
  name: string
  phone: string
  email?: string
  message: string
  propertyId?: number
  preferredContact: 'phone' | 'whatsapp'
}

export interface Inquiry {
  id: number
  propertyId: number
  name: string
  phone: string
  email?: string
  message: string
  createdAt: string
  isRead: boolean
}
