import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin, Ruler, Phone, MessageCircle, Heart, ChevronLeft,
  CheckCircle, Home, FileText, Calendar, FolderOpen, Loader2, AlertCircle,
  Mail, User,
} from 'lucide-react'
import SEO from '../components/common/SEO'
import PropertyGallery from '../components/properties/PropertyGallery'
import { PropertyDocumentsView } from '../components/properties/PropertyDocuments'
import PropertyDocumentsPublic from '../components/properties/PropertyDocumentsPublic'
import PropertyLocationMap from '../components/properties/PropertyLocationMap'
import ShareButton from '../components/properties/ShareButton'
import { useAuth } from '../context/AuthContext'
import { propertiesApi, resolveMediaUrl } from '../services/api'

function formatLakhs(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * "Back to listings" — return to whatever listing page the user came
   * from with all its state (page number, filters, scroll position)
   * intact, by walking one step back in browser history. We only do
   * that when we actually arrived here from inside the app; if someone
   * opened the detail URL directly (external link, refresh on detail
   * page), fall back to a fresh /properties.
   *
   * Detection: react-router seeds location.key to "default" on the
   * first navigation and to a random hash on every subsequent one. A
   * non-default key means at least one prior in-app navigation, so
   * `navigate(-1)` will land on it.
   */
  const handleBack = () => {
    if (location.key !== 'default') navigate(-1)
    else navigate('/properties')
  }
  const propertyId = Number(id)
  const { user } = useAuth()
  const canSeeDocuments = user?.role === 'Admin' || user?.role === 'Employee'

  const query = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => propertiesApi.getById(propertyId),
    enabled: Number.isFinite(propertyId) && propertyId > 0,
    staleTime: 60_000,
  })

  if (query.isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading property…</p>
        </div>
      </main>
    )
  }
  if (query.isError || !query.data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Property not found</h1>
          <p className="text-sm text-gray-500 mb-4">
            This listing may have been removed or you may need to{' '}
            <Link to="/login" className="font-semibold underline" style={{ color: '#EA2D34' }}>sign in</Link>{' '}
            to view free listings.
          </p>
          <Link to="/properties" className="btn-primary inline-flex">
            <ChevronLeft className="w-4 h-4" /> Browse all properties
          </Link>
        </div>
      </main>
    )
  }
  const property = query.data

  // SEO copy — concise summary the search engines + WhatsApp previews pick up
  const seoDescription =
    `${property.areaInCents} cents ${property.propertyType === 'open_land' ? 'open land' : 'plot'} for sale ` +
    `in ${property.city}, ${property.district}. ${formatLakhs(property.totalPrice)}.` +
    (property.roadAccess ? ' Road access.' : '') +
    (property.legalStatus ? ` ${property.legalStatus.slice(0, 60)}.` : '')

  // Combined Product + Place JSON-LD via @graph — gives Google enough
  // signal to surface this as both a real-estate listing and a
  // geo-located result for "land for sale in {city}" queries.
  const propertyUrl = `https://joseforland.com/properties/${property.id}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${propertyUrl}#product`,
        name: property.title,
        description: property.description?.slice(0, 300),
        image: resolveMediaUrl(property.images?.[0]),
        url: propertyUrl,
        category: 'Real Estate / Land',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: property.totalPrice,
          availability: property.status === 'sold'
            ? 'https://schema.org/SoldOut'
            : 'https://schema.org/InStock',
          areaServed: 'Kanyakumari district, Tamil Nadu, India',
        },
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Area (cents)', value: property.areaInCents },
          { '@type': 'PropertyValue', name: 'City', value: property.city },
          { '@type': 'PropertyValue', name: 'District', value: property.district },
          ...(property.serialNo ? [{ '@type': 'PropertyValue', name: 'Reference', value: property.serialNo }] : []),
        ],
      },
      {
        '@type': 'Place',
        '@id': `${propertyUrl}#place`,
        name: `${property.city}, Kanyakumari`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: property.address,
          addressLocality: property.city,
          addressRegion: property.district,
          postalCode: property.pinCode,
          addressCountry: 'IN',
        },
        ...(property.latitude && property.longitude ? {
          geo: { '@type': 'GeoCoordinates', latitude: property.latitude, longitude: property.longitude },
        } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://joseforland.com/' },
          { '@type': 'ListItem', position: 2, name: 'Properties', item: 'https://joseforland.com/properties' },
          { '@type': 'ListItem', position: 3, name: property.city,
            item: `https://joseforland.com/properties?city=${encodeURIComponent(property.city)}` },
          { '@type': 'ListItem', position: 4, name: property.title, item: propertyUrl },
        ],
      },
    ],
  }

  // SEO title slots the city + district behind the listing title so the
  // search snippet reads like "{property} | {city}, Kanyakumari — Jose
  // For Land", which catches both "{property name}" and "{city} land"
  // search variants.
  const seoTitle = `${property.title} | ${property.city}, Kanyakumari`

  return (
    <main className="min-h-screen bg-gray-50">
      <SEO
        path={`/properties/${property.id}`}
        title={seoTitle}
        description={seoDescription}
        image={resolveMediaUrl(property.images?.[0])}
        type="article"
        jsonLd={jsonLd}
      />
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-[#EA2D34] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-[#EA2D34] transition-colors">Properties</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium line-clamp-1">{property.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button onClick={handleBack}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#EA2D34] mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to listings
        </button>

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
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                    {property.serialNo && (
                      // Serial reads as a peer of the title now — same font
                      // family + weight, just in the brand red so it stands
                      // apart without needing the muted chip styling.
                      <span className="text-3xl md:text-4xl font-bold mr-3 align-middle" style={{ color: '#EA2D34' }}>
                        #{property.serialNo}
                      </span>
                    )}
                    {property.title}
                  </h1>
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
                {property.status === 'for_rent' ? (
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: '#6A9739' }}>
                      {(property.areaInSqFt ?? 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                      <Ruler className="w-3 h-3" /> Sq. Ft.
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
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
                      <MapPin className="w-4 h-4 shrink-0" style={{ color: '#EA2D34' }} />
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
                  <FolderOpen className="w-4 h-4" style={{ color: '#EA2D34' }} />
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
                {(() => {
                  const hasDiscount = property.discountPrice != null
                    && property.discountPrice > 0 && property.discountPrice < property.totalPrice
                  const eff = hasDiscount ? property.discountPrice! : property.totalPrice
                  const pct = hasDiscount
                    ? Math.round((1 - property.discountPrice! / property.totalPrice) * 100) : 0
                  const perMonth = property.status === 'for_rent'
                  return (
                    <>
                      <div className="flex items-baseline gap-2 flex-wrap mb-1">
                        <span className="text-3xl font-bold" style={{ color: '#EA2D34' }}>
                          {formatLakhs(eff)}
                          {perMonth && <span className="text-base font-medium text-gray-500"> / month</span>}
                        </span>
                        {hasDiscount && (
                          <span className="text-lg text-gray-400 line-through">{formatLakhs(property.totalPrice)}</span>
                        )}
                      </div>
                      {hasDiscount ? (
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span className="px-2 py-0.5 rounded-full text-white text-xs font-bold" style={{ backgroundColor: '#F59E0B' }}>
                            {pct}% OFF
                          </span>
                          <span style={{ color: '#6A9739' }}>You save {formatLakhs(property.totalPrice - eff)}</span>
                        </div>
                      ) : property.status !== 'for_rent' && property.pricePerCent ? (
                        <div className="text-sm text-gray-500">{formatLakhs(property.pricePerCent)} per cent</div>
                      ) : null}
                    </>
                  )
                })()}
              </div>

              <div className="space-y-3 mb-5">
                <a
                  href="tel:+919994488490"
                  className="flex items-center justify-center gap-2 w-full py-3 text-white font-semibold rounded-xl transition-colors"
                  style={{ backgroundColor: '#EA2D34' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#EA2D34')}
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
                  href="tel:+919944885542"
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 font-semibold rounded-xl transition-colors"
                  style={{ borderColor: '#6A9739', color: '#6A9739' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(106,151,57,0.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  <Phone className="w-4 h-4" />
                  Alt: +91 99448 85542
                </a>
              </div>

              {(property.submittedByPhone || property.submittedByEmail) && (
                <div className="mb-5 rounded-xl border border-gray-100 p-4" style={{ backgroundColor: '#fafafa' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-gray-400">Listed by owner</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {property.submittedByName ?? 'Property owner'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {property.submittedByPhone && (
                      <a
                        href={`tel:${property.submittedByPhone.replace(/\s/g, '')}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold rounded-lg border-2 transition-colors"
                        style={{ borderColor: '#EA2D34', color: '#EA2D34' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,90,95,0.06)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                      >
                        <Phone className="w-4 h-4" />
                        Call Owner: {property.submittedByPhone}
                      </a>
                    )}
                    {property.submittedByEmail && (
                      <a
                        href={`mailto:${property.submittedByEmail}?subject=${encodeURIComponent(`Inquiry: ${property.title}`)}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold rounded-lg border-2 transition-colors break-all"
                        style={{ borderColor: '#6A9739', color: '#6A9739' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(106,151,57,0.06)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                      >
                        <Mail className="w-4 h-4 shrink-0" />
                        Email Owner
                      </a>
                    )}
                  </div>
                </div>
              )}

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
