import { Link } from 'react-router-dom'
import {
  MapPin, Ruler, Phone, MessageCircle, Heart, ChevronLeft,
  CheckCircle, Home, FileText, Calendar, FolderOpen,
} from 'lucide-react'
import PropertyGallery from '../components/properties/PropertyGallery'
import { PropertyDocumentsView } from '../components/properties/PropertyDocuments'
import PropertyDocumentsPublic from '../components/properties/PropertyDocumentsPublic'
import PropertyLocationMap from '../components/properties/PropertyLocationMap'
import ShareButton from '../components/properties/ShareButton'
import { useAuth } from '../context/AuthContext'
import type { Property } from '../types'

function formatLakhs(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

const MOCK_PROPERTY: Property = {
  id: 1,
  title: '15 Cents Prime Land Near Highway – Nagercoil',
  description: `This is a prime land parcel located close to the main road in Nagercoil, Kanyakumari district.
The plot has excellent road frontage and is ideal for residential or commercial construction.

Highlights:
- Located in a rapidly developing area
- Clear legal documents (EC, Patta, Chitta verified)
- All utilities available (electricity, water)
- Well-connected to schools, hospitals, and markets
- No encroachments
- Immediate registration possible

This property is personally verified by our agents. Reach out for a free site visit.`,
  totalPrice: 2250000,
  pricePerCent: 150000,
  address: 'Kottar, Near NH 44',
  city: 'Nagercoil',
  district: 'Kanyakumari',
  state: 'Tamil Nadu',
  pinCode: '629001',
  areaInCents: 15,
  areaInSqFt: 6534,
  propertyType: 'open_land',
  status: 'for_sale',
  images: [],
  features: ['Road Access', 'Clear Title', 'Near Market', 'Water Source', 'Electricity', 'Boundary Wall'],
  agentId: 1,
  createdAt: '2024-01-15',
  updatedAt: '2024-01-15',
  isFeatured: true,
  isVerified: true,
  roadAccess: true,
  nearbyLandmarks: ['Nagercoil Railway Station (2 km)', 'KK Hospitals (1.5 km)', 'NH 44 (200 m)', 'City Bus Stand (800 m)'],
  legalStatus: 'Clear – EC, Patta, Chitta available',
  documents: [
    {
      id: 1, propertyId: 1, type: 'ec', name: 'EC for last 13 years (2010 – 2023)',
      fileName: 'ec-2010-2023.pdf', fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
      fileSize: 248000, mimeType: 'application/pdf', isPublic: true, uploadedAt: '2024-01-10',
    },
    {
      id: 2, propertyId: 1, type: 'patta', name: 'Patta Document',
      fileName: 'patta.pdf', fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
      fileSize: 156000, mimeType: 'application/pdf', isPublic: true, uploadedAt: '2024-01-10',
    },
    {
      id: 3, propertyId: 1, type: 'chitta', name: 'Chitta Extract',
      fileName: 'chitta.pdf', fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
      fileSize: 98000, mimeType: 'application/pdf', isPublic: true, uploadedAt: '2024-01-10',
    },
    {
      id: 4, propertyId: 1, type: 'layout', name: 'Survey & Layout Plan',
      fileName: 'layout.jpg', fileUrl: 'https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=1200&q=80',
      fileSize: 1240000, mimeType: 'image/jpeg', isPublic: true, uploadedAt: '2024-01-12',
    },
  ],
}

export default function PropertyDetailPage() {
  const property = MOCK_PROPERTY
  const { user } = useAuth()
  const canSeeDocuments = user?.role === 'Admin' || user?.role === 'Employee'

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-[#FF5A5F] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-[#FF5A5F] transition-colors">Properties</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium line-clamp-1">{property.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/properties" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#FF5A5F] mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to listings
        </Link>

        <div className="mb-6">
          <PropertyGallery images={property.images} title={property.title} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: '#293237' }}>
                      {property.propertyType === 'open_land' ? 'Open Land' : property.propertyType}
                    </span>
                    {property.isVerified && (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {property.isFeatured && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500 text-white">
                        Featured
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    {property.address}, {property.city}, {property.district} – {property.pinCode}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Heart className="w-4 h-4 text-gray-400" />
                  </button>
                  <ShareButton
                    variant="icon"
                    title={property.title}
                    description={`${property.areaInCents} cents · ${formatLakhs(property.totalPrice)} · ${property.address}, ${property.city}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: '#6A9739' }}>{property.areaInCents}</div>
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                    <Ruler className="w-3 h-3" /> Cents
                  </div>
                </div>
                {property.areaInSqFt && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">{property.areaInSqFt.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Sq. Ft.</div>
                  </div>
                )}
                {property.bedrooms && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">{property.bedrooms} BHK</div>
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                      <Home className="w-3 h-3" /> Building
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {new Date(property.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" /> Listed
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </div>
            </div>

            {/* Location map */}
            <PropertyLocationMap property={property} />

            {property.features.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-3">Features &amp; Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#6A9739' }} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {property.nearbyLandmarks && property.nearbyLandmarks.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-3">Nearby Landmarks</h2>
                <ul className="space-y-2">
                  {property.nearbyLandmarks.map((lm) => (
                    <li key={lm} className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 shrink-0" style={{ color: '#FF5A5F' }} />
                      {lm}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {property.legalStatus && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: '#6A9739' }} />
                  Legal Status
                </h2>
                <p className="text-sm text-gray-600">{property.legalStatus}</p>
              </div>
            )}

            {/* Property Documents */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" style={{ color: '#FF5A5F' }} />
                  Property Documents
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(106,151,57,0.1)', color: '#6A9739' }}>
                  {(property.documents ?? []).filter(d => d.isPublic).length} verified
                </span>
              </div>

              {canSeeDocuments ? (
                <>
                  <p className="text-xs text-gray-500 mb-4">
                    Internal access · {user?.role}. Click to preview or download verified copies.
                  </p>
                  <PropertyDocumentsView documents={property.documents ?? []} />
                </>
              ) : (
                <PropertyDocumentsPublic
                  documents={property.documents ?? []}
                  propertyId={property.id}
                  propertyTitle={property.title}
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-36">
              <div className="mb-4 pb-4 border-b border-gray-100">
                <div className="text-3xl font-bold mb-1" style={{ color: '#FF5A5F' }}>
                  {formatLakhs(property.totalPrice)}
                </div>
                {property.pricePerCent && (
                  <div className="text-sm text-gray-500">
                    {formatLakhs(property.pricePerCent)} per cent
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-5">
                <a
                  href="tel:+919994488490"
                  className="flex items-center justify-center gap-2 w-full py-3 text-white font-semibold rounded-xl transition-colors"
                  style={{ backgroundColor: '#FF5A5F' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FF5A5F')}
                >
                  <Phone className="w-4 h-4" />
                  Call: +91 99944 88490
                </a>
                <a
                  href="https://wa.me/919994488490"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 text-white font-semibold rounded-xl transition-colors"
                  style={{ backgroundColor: '#25D366' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1da851')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#25D366')}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Inquiry
                </a>
                <a
                  href="tel:+919698712904"
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 font-semibold rounded-xl transition-colors"
                  style={{ borderColor: '#6A9739', color: '#6A9739' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(106,151,57,0.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  <Phone className="w-4 h-4" />
                  Alt: +91 96987 12904
                </a>
              </div>

              <div className="rounded-xl p-4 text-center border" style={{ backgroundColor: 'rgba(106,151,57,0.08)', borderColor: 'rgba(106,151,57,0.2)' }}>
                <p className="font-semibold text-sm mb-1" style={{ color: '#547a2d' }}>
                  Free Doorstep Consultation
                </p>
                <p className="text-xs" style={{ color: '#6A9739' }}>
                  We'll visit the property with you and explain all details for FREE.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
