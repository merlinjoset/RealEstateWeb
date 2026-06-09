import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  Save, CheckCircle2, Phone, Mail, User, MapPin, IndianRupee,
  Sparkles, Loader2, AlertCircle, ArrowLeft, Trees, Home as HomeIcon,
  Wheat, Building2, Map as MapPinIcon, FileText, Video,
  Image as ImageIcon, Upload, Trash2, Star, GripVertical,
} from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import LocationPicker from '../components/properties/LocationPicker'
import MarketingPlanPicker from '../components/properties/MarketingPlanPicker'
import { propertiesApi, uploadsApi, type PropertySubmission } from '../services/api'
import { isValidEmail, EMAIL_PATTERN } from '../utils/email'
import { useAuth } from '../context/AuthContext'
import type { MarketingPlan } from '../types'

const CITIES = [
  'Nagercoil', 'Marthandam', 'Thuckalay', 'Kanyakumari', 'Colachel',
  'Kaliyakkavilai', 'Aralvaimozhy', 'Kuzhithurai',
]

const FEATURES_OPTIONS = [
  'Road Access', 'Clear Title', 'Boundary Wall', 'Water Source', 'Electricity',
  'Near Market', 'Near School', 'Near Hospital', 'Corner Plot', 'Highway Access',
  'Borewell', 'Compound Wall', 'Documents Ready',
]

const PROPERTY_TYPES = [
  { value: 'open_land',          label: 'Open Land',          icon: Trees,      color: '#FF5A5F' },
  { value: 'land_with_building', label: 'Land + Building',    icon: HomeIcon,   color: '#6A9739' },
  { value: 'agricultural',       label: 'Agricultural',       icon: Wheat,      color: '#8BC34A' },
  { value: 'residential_plot',   label: 'Residential Plot',   icon: MapPinIcon, color: '#F59E0B' },
  { value: 'commercial',         label: 'Commercial',         icon: Building2,  color: '#293237' },
] as const

interface FormState {
  // Submitter contact
  submitterName: string
  submitterPhone: string
  submitterEmail: string
  // Property
  serialNo: string
  title: string
  description: string
  propertyType: string
  totalPrice: string
  pricePerCent: string
  areaInCents: string
  city: string
  address: string
  pinCode: string
  legalStatus: string
  roadAccess: boolean
  features: string[]
  // Optional Google-Maps coordinates (stored as strings to ease input)
  latitude: string
  longitude: string
  // Marketing tier — Free (default) or VideoPromotion (2% brokerage)
  marketingPlan: MarketingPlan
  // Required by API but not surfaced as UI
  district: string
  state: string
}

const INITIAL: FormState = {
  // Phone is the bare 10-digit local number — the +91 country code is
  // shown as a visual prefix next to the input, not stored in the value.
  submitterName: '', submitterPhone: '', submitterEmail: '',
  serialNo: '',
  title: '', description: '', propertyType: 'open_land',
  totalPrice: '', pricePerCent: '', areaInCents: '', city: '', address: '', pinCode: '',
  legalStatus: '', roadAccess: false, features: [],
  latitude: '', longitude: '',
  marketingPlan: 'Free',
  district: 'Kanyakumari', state: 'Tamil Nadu',
}

function formatLakhs(v: string) {
  const n = Number(v)
  if (!n || isNaN(n)) return ''
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN')}`
}


// Local-only image record. `preview` is an object URL we create from the
// File for the thumbnail; revoked when the image is removed or the page
// unmounts. The `file` itself only gets uploaded at submit time.
interface PendingImage {
  id: string
  preview: string
  file: File
}

export default function SubmitPropertyPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  // ?type=rental switches the form into rental mode: the listing is saved as
  // for_rent, marketing is forced Free, and the owner must be signed in.
  const isRental = searchParams.get('type') === 'rental'

  const [form, setForm] = useState<FormState>(INITIAL)
  const [submittedId, setSubmittedId] = useState<number | null>(null)

  // Rental owners must be logged in. Bounce anonymous visitors to /login and
  // return them to this form afterwards.
  useEffect(() => {
    if (isRental && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: '/sell?type=rental' } })
    }
  }, [isRental, isAuthenticated, navigate])

  // Prefill the owner's contact from their account for rental submissions.
  useEffect(() => {
    if (isRental && user) {
      setForm((f) => ({
        ...f,
        submitterName: f.submitterName || [user.firstName, user.lastName].filter(Boolean).join(' '),
        submitterEmail: f.submitterEmail || user.email || '',
        submitterPhone: f.submitterPhone || (user.phone ?? '').replace(/\D/g, '').slice(-10),
      }))
    }
  }, [isRental, user])

  const [images, setImages] = useState<PendingImage[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  // Track uploads-in-flight at submit time so the button can show progress.
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  // Image grid helpers — match the admin Add Property page so the seller
  // experience is consistent across both submission flows.
  const handleImagesAdd = (files: FileList | null) => {
    if (!files) return
    setUploadError(null)
    const next: PendingImage[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setUploadError(`"${file.name}" is not an image.`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`"${file.name}" is larger than 5 MB.`)
        continue
      }
      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        preview: URL.createObjectURL(file),
        file,
      })
    }
    if (next.length > 0) setImages(prev => [...prev, ...next])
  }
  const removeImage = (id: string) =>
    setImages(prev => {
      const target = prev.find(i => i.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter(i => i.id !== id)
    })
  const moveImage = (from: number, to: number) =>
    setImages(prev => {
      if (to < 0 || to >= prev.length) return prev
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })

  const toggleFeature = (f: string) =>
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter(x => x !== f)
        : [...prev.features, f],
    }))

  const submitMutation = useMutation({
    mutationFn: (payload: PropertySubmission) => propertiesApi.submit(payload),
    onSuccess: (created) => setSubmittedId(created.id),
  })

  // With the input constrained to exactly 10 digits and the +91 prefix
  // shown as a static label, the phone is always Indian by construction.
  // Email becomes a pure optional field.
  const emailRequired = false
  // Flag visibly incomplete emails — silent while the field is empty.
  const emailLooksInvalid = form.submitterEmail.length > 0 && !isValidEmail(form.submitterEmail)

  // Cross-check total price vs per-cent × area. Allows 1% slop so
  // sellers can round (eg. 7 cents at ₹10.5L/cent → ₹73.5L total).
  // Only fires when all three are filled and individually valid.
  const price    = Number(form.totalPrice)
  const perCent  = Number(form.pricePerCent)
  const area     = Number(form.areaInCents)
  const priceMismatchError: string | null = (() => {
    if (!form.pricePerCent || !form.totalPrice || !form.areaInCents) return null
    if (isNaN(price) || price <= 0)     return null
    if (isNaN(perCent) || perCent <= 0) return null
    if (isNaN(area)    || area <= 0)    return null
    const expectedTotal = perCent * area
    const drift = Math.abs(expectedTotal - price) / Math.max(expectedTotal, price)
    if (drift <= 0.01) return null
    const fmt = (n: number) =>
      n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` :
      n >= 100000   ? `₹${(n / 100000).toFixed(2)} L`   :
                      `₹${Math.round(n).toLocaleString('en-IN')}`
    return `Doesn't match — ${area} cents × ${fmt(perCent)} = ${fmt(expectedTotal)}, ` +
           `but total is ${fmt(price)}. Check one of the three fields.`
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (priceMismatchError) {
      document.getElementById('price-per-cent')?.focus()
      return
    }
    if (emailRequired && !form.submitterEmail.trim()) {
      document.getElementById('submitter-email')?.focus()
      return
    }

    // Upload pending images first, then submit the property with the
    // resulting /media URLs in `images`. We upload sequentially so a
    // weak mobile connection doesn't open ten concurrent multipart
    // requests; the per-file UI hint reports `done/total`.
    let imageUrls: string[] = []
    if (images.length > 0) {
      setUploadError(null)
      setUploadProgress({ done: 0, total: images.length })
      try {
        for (let i = 0; i < images.length; i++) {
          const { url } = await uploadsApi.propertyImage(images[i].file)
          imageUrls.push(url)
          setUploadProgress({ done: i + 1, total: images.length })
        }
      } catch (err) {
        setUploadProgress(null)
        setUploadError('We couldn’t upload one of your images. Please retry.')
        return
      }
      setUploadProgress(null)
    }

    const payload: PropertySubmission = {
      serialNo: form.serialNo.trim() || undefined,
      title: form.title,
      description: form.description,
      totalPrice: Number(form.totalPrice),
      pricePerCent: form.pricePerCent ? Number(form.pricePerCent) : undefined,
      areaInCents: Number(form.areaInCents),
      address: form.address,
      city: form.city,
      district: form.district,
      state: form.state,
      pinCode: form.pinCode,
      propertyType: form.propertyType,
      status: isRental ? 'for_rent' : 'for_sale',
      features: form.features,
      images: imageUrls,
      legalStatus: form.legalStatus || undefined,
      roadAccess: form.roadAccess,
      // Rentals are always free listings; the Video Promotion tier is sale-only.
      marketingPlan: isRental ? 'Free' : form.marketingPlan,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      submitterName: form.submitterName.trim(),
      submitterPhone: form.submitterPhone.trim(),
      submitterEmail: form.submitterEmail.trim() || undefined,
    }
    submitMutation.mutate(payload)
  }

  /* ─── Success screen ─── */
  if (submittedId !== null) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#F8F6F3' }}>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
            <CheckCircle2 className="w-10 h-10" strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4" style={{ color: '#111111' }}>
            Submission received!
          </h1>
          <p className="text-lg leading-relaxed mb-2" style={{ color: '#4B5563' }}>
            Thank you, <strong style={{ color: '#111111' }}>{form.submitterName}</strong>.
            Your property <em>"{form.title}"</em> is now in our review queue.
          </p>
          <p className="text-base leading-relaxed mb-8" style={{ color: '#6B7280' }}>
            Our team will personally review the listing within <strong>24 hours</strong> and contact you
            on <strong>{form.submitterPhone}</strong>
            {form.submitterEmail && <> and <strong>{form.submitterEmail}</strong></>}
            {' '}to confirm details and arrange a free site visit if needed.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            <div className="p-4 rounded-xl border bg-white text-left flex items-center gap-3"
              style={{ borderColor: 'rgba(255,90,95,0.2)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(255,90,95,0.10)', color: '#FF5A5F' }}>
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">SMS Sent</div>
                <div className="text-sm font-medium" style={{ color: '#111111' }}>Confirmation on its way</div>
              </div>
            </div>
            {form.submitterEmail && (
              <div className="p-4 rounded-xl border bg-white text-left flex items-center gap-3"
                style={{ borderColor: 'rgba(106,151,57,0.2)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Email Sent</div>
                  <div className="text-sm font-medium" style={{ color: '#111111' }}>Check your inbox</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="btn-ghost">← Back to home</Link>
            <Link to="/properties" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#FF5A5F' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FF5A5F')}>
              Browse other listings
            </Link>
          </div>
        </div>
      </main>
    )
  }

  /* ─── Form ─── */
  return (
    <main className="min-h-screen pb-16" style={{ backgroundColor: '#F8F6F3' }}>
      <PageHeader
        eyebrow={isRental ? 'List a rental' : 'Sell with us'}
        title={isRental ? 'List Your Rental Property' : 'Submit Your Property'}
        highlight={isRental ? 'Rental' : 'Property'}
        description={isRental
          ? 'List your house, plot or commercial space for rent on Jose For Land. Free listing — our team reviews the details (usually within 24 hours), then it goes live for renters to browse without signing in.'
          : 'List your land for sale on Jose For Land. Once you submit, our team personally reviews and verifies the details — usually within 24 hours. Free of cost, zero brokerage.'}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <form onSubmit={handleSubmit} className="space-y-5">
          {submitMutation.isError && (
            <div className="rounded-xl p-4 border-2 flex gap-3"
              style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
              <div>
                <p className="font-bold text-sm" style={{ color: '#991B1B' }}>Submission failed</p>
                <p className="text-xs mt-0.5" style={{ color: '#B91C1C' }}>
                  Please review the form and try again. If the problem persists, call us at +91 99944 88490.
                </p>
              </div>
            </div>
          )}

          {/* === Your details === */}
          <Section icon={User} title="Your Details" desc="So we can contact you to confirm and verify the listing">
            <Row>
              <Field label="Full Name *">
                <input required value={form.submitterName}
                  onChange={(e) => set('submitterName', e.target.value)}
                  className="input-field" placeholder="e.g. Rajan Kumar" />
              </Field>
              <Field label="Phone Number *" hint="We will send a confirmation SMS">
                <div className="relative">
                  {/* Static "+91" prefix label — visual only, the input value
                      holds just the 10-digit local number. */}
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
                    +91
                  </span>
                  <input required type="tel" value={form.submitterPhone}
                    inputMode="numeric"
                    maxLength={10}
                    onChange={(e) => set('submitterPhone', e.target.value.replace(/\D/g, ''))}
                    className="input-field pl-12" placeholder="10-digit mobile" />
                </div>
              </Field>
            </Row>

            <Field
              label={emailRequired ? 'Email *' : 'Email (optional)'}
              hint={emailLooksInvalid
                ? '⚠ That doesn’t look like a valid email (e.g. you@example.com)'
                : emailRequired
                  ? 'We can only deliver SMS to Indian mobiles, so please share an email'
                  : 'Get a copy of your submission by email'}>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="submitter-email"
                  required={emailRequired}
                  type="email"
                  pattern={EMAIL_PATTERN}
                  value={form.submitterEmail}
                  onChange={(e) => set('submitterEmail', e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  style={(emailRequired && !form.submitterEmail) || emailLooksInvalid
                    ? { borderColor: '#F59E0B' } : undefined} />
              </div>
            </Field>
          </Section>

          {/* === Property basics === */}
          <Section icon={MapPinIcon} title="Property Details" desc="Tell us about the land you're selling">
            <Field label="Serial No (optional)" hint="A reference code you can use to track this listing — e.g. JFL-2026-001">
              <input value={form.serialNo}
                onChange={(e) => set('serialNo', e.target.value)}
                className="input-field" maxLength={50}
                placeholder="e.g. JFL-2026-001" />
            </Field>

            <Field label="Listing Title *" hint="Clear, specific titles attract more buyers">
              <input required value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className="input-field" maxLength={100}
                placeholder="e.g. 15 Cents Prime Land Near Highway – Nagercoil" />
            </Field>

            <Field label="Property Type *">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PROPERTY_TYPES.map(t => {
                  const Icon = t.icon
                  const isActive = form.propertyType === t.value
                  return (
                    <button key={t.value} type="button"
                      onClick={() => set('propertyType', t.value)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all"
                      style={isActive
                        ? { backgroundColor: t.color, borderColor: t.color, color: 'white' }
                        : { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#4B5563' }}>
                      <Icon className="w-5 h-5" />
                      <span className="leading-tight text-center">{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </Field>

            <Field label="Description *" hint="Highlight surroundings, road access, water, and any standout features">
              <textarea required rows={4}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe the property in your own words..."
                className="input-field resize-none" maxLength={1000} />
            </Field>
          </Section>

          {/* === Pricing & area === */}
          <Section icon={IndianRupee} title={isRental ? 'Rent & Area' : 'Pricing & Area'} desc={isRental ? 'Monthly rent in rupees, area in cents' : 'Indian-style: price in rupees, area in cents'}>
            <Row>
              <Field label={isRental ? 'Monthly Rent (₹) *' : 'Total Price (₹) *'}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input required type="number" min={isRental ? '1000' : '10000'}
                    value={form.totalPrice}
                    onChange={(e) => set('totalPrice', e.target.value)}
                    className="input-field pl-7" placeholder={isRental ? '15000' : '2250000'} />
                </div>
                {form.totalPrice && (
                  <p className="text-xs mt-1.5 font-semibold" style={{ color: '#6A9739' }}>
                    {formatLakhs(form.totalPrice)}
                  </p>
                )}
              </Field>
              <Field label="Area (in Cents) *" hint="1 cent ≈ 435.6 sq ft · decimals OK (e.g. 1.8, 7.25)">
                <div className="relative">
                  {/* step="any" lets the browser accept any decimal precision
                      (1.8, 7.25, 3.125, …). The previous step="0.5" rejected
                      everything that wasn't a multiple of 0.5 cents. */}
                  <input required type="number" min="0.01" step="any"
                    value={form.areaInCents}
                    onChange={(e) => set('areaInCents', e.target.value)}
                    className="input-field pr-14" placeholder="15" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">cents</span>
                </div>
              </Field>
            </Row>
            {!isRental && (
              <Field label="Price per Cent (₹) — optional"
                hint={priceMismatchError ?? 'We cross-check this against the total price and area to catch typos.'}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input
                    id="price-per-cent"
                    type="number" min="1"
                    value={form.pricePerCent}
                    onChange={(e) => set('pricePerCent', e.target.value)}
                    placeholder="150000"
                    className="input-field pl-7"
                    style={priceMismatchError ? { borderColor: '#B91C1C' } : undefined} />
                </div>
              </Field>
            )}
          </Section>

          {/* === Location === */}
          <Section icon={MapPin} title="Location">
            <Row>
              <Field label="City / Town *">
                <select required value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  className="input-field">
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="PIN Code">
                <input value={form.pinCode}
                  onChange={(e) => set('pinCode', e.target.value)}
                  className="input-field" maxLength={7} placeholder="629 001" />
              </Field>
            </Row>
            <Field label="Address / Locality *">
              <input required value={form.address}
                onChange={(e) => set('address', e.target.value)}
                className="input-field" placeholder="Street, area, or local landmark name" />
            </Field>

            <Field
              label="Pin on Google Maps"
              hint="Optional — helps buyers find the plot quickly"
            >
              <LocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
              />
            </Field>
          </Section>

          {/* === Documents & features === */}
          <Section icon={FileText} title="Legal & Features" desc="Help buyers know your property is verified">
            <Field label="Legal Status" hint="What documents are ready?">
              <input value={form.legalStatus}
                onChange={(e) => set('legalStatus', e.target.value)}
                className="input-field"
                placeholder="e.g. Clear — EC, Patta, Chitta available" />
            </Field>

            <Field label={`Features (${form.features.length} selected)`}>
              <div className="flex flex-wrap gap-2">
                {FEATURES_OPTIONS.map(f => {
                  const isActive = form.features.includes(f)
                  return (
                    <button key={f} type="button" onClick={() => toggleFeature(f)}
                      className="px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all"
                      style={isActive
                        ? { backgroundColor: '#6A9739', borderColor: '#6A9739', color: 'white' }
                        : { borderColor: '#e5e7eb', color: '#4b5563' }}>
                      {f}
                    </button>
                  )
                })}
              </div>
            </Field>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={form.roadAccess}
                onChange={(e) => set('roadAccess', e.target.checked)}
                className="accent-[#6A9739] w-4 h-4" />
              <div>
                <div className="text-sm font-semibold text-gray-900">Direct road access</div>
                <div className="text-xs text-gray-500">Plot has vehicle access from a public road</div>
              </div>
            </label>
          </Section>

          {/* === Property images === */}
          <Section icon={ImageIcon} title="Property Images" desc="Add 3–5 photos of the plot, surroundings, and key landmarks. First one becomes the cover.">
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                {images.map((img, idx) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 text-white"
                        style={{ backgroundColor: '#FF5A5F' }}>
                        <Star className="w-2.5 h-2.5" fill="currentColor" /> Cover
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {idx > 0 && (
                        <button type="button" onClick={() => moveImage(idx, idx - 1)}
                          className="w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-700"
                          title="Move left">
                          <GripVertical className="w-3.5 h-3.5 -rotate-90" />
                        </button>
                      )}
                      <button type="button" onClick={() => removeImage(img.id)}
                        className="w-7 h-7 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white"
                        title="Remove">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <label className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
              style={{ borderColor: '#CFD8DC' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6A9739')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#CFD8DC')}>
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => { handleImagesAdd(e.target.files); e.target.value = '' }} />
              <Upload className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">
                {images.length === 0 ? 'Click to upload property images' : 'Add more images'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP up to 5 MB each · You can select multiple</p>
            </label>
            {uploadError && (
              <p className="mt-2 text-xs flex items-center gap-1" style={{ color: '#B45309' }}>
                <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
              </p>
            )}
          </Section>

          {/* === Marketing plan (sale only — rentals are always free) === */}
          {!isRental && (
            <Section
              icon={Video}
              title="Marketing Plan"
              desc="Choose how you'd like your property promoted"
            >
              <MarketingPlanPicker
                value={form.marketingPlan}
                onChange={(plan) => set('marketingPlan', plan)}
                totalPriceStr={form.totalPrice}
              />
              {form.marketingPlan === 'VideoPromotion' && (
                <div className="mt-3 rounded-xl p-3 text-xs flex items-start gap-2.5"
                  style={{ backgroundColor: 'rgba(255,90,95,0.06)', border: '1px solid rgba(255,90,95,0.2)', color: '#7F1D1D' }}>
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#FF5A5F' }} />
                  <span>
                    <strong>Sells faster — often sooner than expected.</strong> You get full
                    <strong> end-to-end support</strong> — we shortlist buyers, run site visits, handle paperwork and
                    registration on your behalf. <strong>2% brokerage</strong> only applies on a successful sale,
                    so <em>you pay nothing upfront</em>.
                  </span>
                </div>
              )}
            </Section>
          )}

          {/* === Trust strip === */}
          <div className="rounded-xl p-5 flex items-start gap-3"
            style={{ backgroundColor: 'rgba(106,151,57,0.06)', border: '1px solid rgba(106,151,57,0.2)' }}>
            <Sparkles className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#6A9739' }} />
            <div className="text-xs leading-relaxed" style={{ color: '#374151' }}>
              <strong style={{ color: '#111111' }}>What happens next:</strong> Our team will call you within 24 hours
              to verify the details, schedule a free site visit, and prepare professional photographs.
              {isRental
                ? <> Your rental listing is <strong>free</strong> — once approved it appears on the Rental Properties page for renters to browse without signing in.</>
                : form.marketingPlan === 'Free'
                  ? <> Listing fees are <strong>₹0 — zero brokerage</strong>. We earn only when your property sells.</>
                  : <> You picked the <strong>Video Promotion</strong> plan — we'll coordinate the shoot and only charge the 2% fee on a successful sale.</>}
            </div>
          </div>

          {/* === Submit === */}
          <div className="flex items-center justify-between gap-3 pt-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FF5A5F] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Cancel
            </Link>
            <button type="submit"
              disabled={submitMutation.isPending || uploadProgress != null}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-base font-bold rounded-xl shadow-lg transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#FF5A5F' }}
              onMouseEnter={e => !submitMutation.isPending && (e.currentTarget.style.backgroundColor = '#e04a4f')}
              onMouseLeave={e => !submitMutation.isPending && (e.currentTarget.style.backgroundColor = '#FF5A5F')}>
              {uploadProgress
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading {uploadProgress.done}/{uploadProgress.total}…</>
                : submitMutation.isPending
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</>
                  : <><Save className="w-5 h-5" /> Submit Property</>
              }
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

/* ─────────────────── Helpers ─────────────────── */

function Section({ icon: Icon, title, desc, children }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(106,151,57,0.08)', color: '#6A9739' }}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight">{title}</h3>
          {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between gap-2">
        <span>{label}</span>
        {hint && <span className="text-[11px] font-normal text-gray-400">{hint}</span>}
      </label>
      {children}
    </div>
  )
}
