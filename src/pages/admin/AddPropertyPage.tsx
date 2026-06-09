import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Save, X, Upload, FolderOpen, Info, IndianRupee, MapPin, Sparkles,
  Image as ImageIcon, Settings as SettingsIcon, Check, Star, GripVertical,
  Trash2, Eye, AlertCircle, ArrowLeft, Video, User,
  Home as HomeIcon, Trees, Wheat, Building2, Map as MapPinIcon,
} from 'lucide-react'
import { PropertyDocumentsEditor } from '../../components/properties/PropertyDocuments'
import LocationPicker from '../../components/properties/LocationPicker'
import MarketingPlanPicker from '../../components/properties/MarketingPlanPicker'
import { propertiesApi, uploadsApi, type PropertySubmission, type PropertyUpdate } from '../../services/api'
import type { MarketingPlan, PropertyDocument } from '../../types'

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
  { value: 'open_land',          label: 'Open Land',          icon: Trees,       color: '#FF5A5F' },
  { value: 'land_with_building', label: 'Land + Building',    icon: HomeIcon,    color: '#6A9739' },
  { value: 'agricultural',       label: 'Agricultural',       icon: Wheat,       color: '#8BC34A' },
  { value: 'residential_plot',   label: 'Residential Plot',   icon: MapPinIcon,  color: '#F59E0B' },
  { value: 'commercial',         label: 'Commercial',         icon: Building2,   color: '#293237' },
] as const

interface FormState {
  serialNo: string
  title: string
  description: string
  totalPrice: string
  pricePerCent: string
  areaInCents: string
  city: string
  address: string
  pinCode: string
  propertyType: string
  bedrooms: string
  bathrooms: string
  roadAccess: boolean
  isFeatured: boolean
  isVerified: boolean
  legalStatus: string
  nearbyLandmarks: string
  features: string[]
  latitude: string
  longitude: string
  marketingPlan: MarketingPlan
  // Owner / seller contact for this listing (editable in edit mode).
  submitterName: string
  submitterPhone: string
  submitterEmail: string
}

const INITIAL: FormState = {
  serialNo: '',
  title: '', description: '', totalPrice: '', pricePerCent: '',
  areaInCents: '', city: '', address: '', pinCode: '',
  propertyType: 'open_land', bedrooms: '', bathrooms: '',
  roadAccess: false, isFeatured: false, isVerified: false, legalStatus: '',
  nearbyLandmarks: '', features: [],
  latitude: '', longitude: '',
  marketingPlan: 'Free',
  submitterName: '', submitterPhone: '', submitterEmail: '',
}

interface SectionDef {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  isComplete: (form: FormState) => boolean
  isOptional?: boolean
}

const SECTIONS: SectionDef[] = [
  { id: 'basic',    label: 'Basic Info',     icon: Info,         isComplete: (f) => f.title.length > 0 && f.description.length > 0 },
  { id: 'pricing',  label: 'Pricing & Area', icon: IndianRupee,  isComplete: (f) => f.totalPrice !== '' && f.areaInCents !== '' },
  { id: 'location', label: 'Location',       icon: MapPin,       isComplete: (f) => f.city.length > 0 },
  { id: 'features', label: 'Features',       icon: Sparkles,     isComplete: (f) => f.features.length > 0, isOptional: true },
  { id: 'marketing', label: 'Marketing',     icon: Video,        isComplete: (f) => f.marketingPlan === 'VideoPromotion' || f.marketingPlan === 'Free', isOptional: true },
  { id: 'images',   label: 'Images',         icon: ImageIcon,    isComplete: (_f) => false, isOptional: true },
  { id: 'documents', label: 'Documents',     icon: FolderOpen,   isComplete: (_f) => false, isOptional: true },
  { id: 'options',  label: 'Options',        icon: SettingsIcon, isComplete: (_f) => true,  isOptional: true },
]

// Maps each field to the section it lives in, so we can scroll to / highlight the right one
const FIELD_SECTION: Partial<Record<keyof FormState, string>> = {
  title: 'basic', description: 'basic', propertyType: 'basic', legalStatus: 'basic',
  areaInCents: 'pricing', totalPrice: 'pricing', pricePerCent: 'pricing',
  city: 'location', address: 'location', pinCode: 'location',
  nearbyLandmarks: 'location', bedrooms: 'location', bathrooms: 'location',
  latitude: 'location', longitude: 'location',
}

function formatLakhs(amountStr: string) {
  const amount = Number(amountStr)
  if (!amount || isNaN(amount)) return '—'
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

type Errors = Partial<Record<keyof FormState, string>>

function validate(form: FormState): Errors {
  const e: Errors = {}

  // Title
  if (!form.title.trim()) {
    e.title = 'Title is required'
  } else if (form.title.trim().length < 10) {
    e.title = 'Title is too short — aim for at least 10 characters'
  }

  // Description
  if (!form.description.trim()) {
    e.description = 'Description is required'
  } else if (form.description.trim().length < 30) {
    e.description = 'Add a bit more detail (minimum 30 characters)'
  }

  // Area
  const area = Number(form.areaInCents)
  if (!form.areaInCents) {
    e.areaInCents = 'Area is required'
  } else if (isNaN(area) || area <= 0) {
    e.areaInCents = 'Enter a valid area in cents'
  } else if (area > 10000) {
    e.areaInCents = 'Area looks too large — please verify'
  }

  // Total Price
  const price = Number(form.totalPrice)
  if (!form.totalPrice) {
    e.totalPrice = 'Total price is required'
  } else if (isNaN(price) || price <= 0) {
    e.totalPrice = 'Enter a valid price'
  } else if (price < 10000) {
    e.totalPrice = 'Price seems too low — verify the amount'
  }

  // Price per cent — optional, but if set it must agree with total / area.
  // We allow a 1% slop because admins often round (eg. 7 cents at
  // ₹10.5L/cent = ₹73.5L total, not the exact ₹73,500,000.).
  const perCent = Number(form.pricePerCent)
  if (form.pricePerCent && (isNaN(perCent) || perCent <= 0)) {
    e.pricePerCent = 'Enter a valid price per cent'
  } else if (form.pricePerCent && !e.totalPrice && !e.areaInCents && area > 0) {
    const expectedTotal = perCent * area
    const drift = Math.abs(expectedTotal - price) / Math.max(expectedTotal, price)
    if (drift > 0.01) {
      // Format the expected total in lakhs/crores so the admin sees the
      // exact number we'd accept and can pick which field to fix.
      const fmt = (n: number) =>
        n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` :
        n >= 100000   ? `₹${(n / 100000).toFixed(2)} L`   :
                        `₹${Math.round(n).toLocaleString('en-IN')}`
      e.pricePerCent =
        `Doesn't match — ${area} cents × ${fmt(perCent)} = ${fmt(expectedTotal)}, ` +
        `but total is ${fmt(price)}. Check one of the three fields.`
    }
  }

  // City
  if (!form.city) {
    e.city = 'Please select a city'
  }

  // PIN code (optional but if provided must be valid)
  if (form.pinCode && !/^\d{6}$/.test(form.pinCode.replace(/\s/g, ''))) {
    e.pinCode = 'PIN code must be 6 digits'
  }

  // Coordinates — optional, but if one is set both must be valid
  const latRaw = form.latitude.trim()
  const lngRaw = form.longitude.trim()
  if (latRaw || lngRaw) {
    const lat = Number(latRaw)
    const lng = Number(lngRaw)
    if (!latRaw || isNaN(lat) || lat < -90 || lat > 90) {
      e.latitude = 'Latitude must be between -90 and 90'
    }
    if (!lngRaw || isNaN(lng) || lng < -180 || lng > 180) {
      e.longitude = 'Longitude must be between -180 and 180'
    }
  }

  // Bedrooms/Bathrooms (only if Land + Building)
  if (form.propertyType === 'land_with_building') {
    if (form.bedrooms && (isNaN(Number(form.bedrooms)) || Number(form.bedrooms) <= 0)) {
      e.bedrooms = 'Enter a valid number'
    }
    if (form.bathrooms && (isNaN(Number(form.bathrooms)) || Number(form.bathrooms) <= 0)) {
      e.bathrooms = 'Enter a valid number'
    }
  }

  return e
}

export default function AddPropertyPage() {
  const { id } = useParams<{ id?: string }>()
  const isEditMode = Boolean(id)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [documents, setDocuments] = useState<PropertyDocument[]>([])
  // New images the admin has just picked — `file` is the pending upload,
  // `url` is the blob preview. Already-saved images on an edited property
  // would be loaded separately (TODO when edit prefill is wired to the API).
  const [images, setImages] = useState<{ id: string; url: string; file: File }[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null)
  const [activeSection, setActiveSection] = useState<string>('basic')
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const navigate = useNavigate()
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Edit-mode prefill — fetch the real property by id and hydrate the
  // form. (Previously this was hardcoded mock data, which is why every
  // edit screen looked identical regardless of which listing you opened.)
  useEffect(() => {
    if (!isEditMode || !id) return
    let cancelled = false
    propertiesApi.getById(Number(id))
      .then((p) => {
        if (cancelled) return
        setForm({
          serialNo: p.serialNo ?? '',
          title: p.title ?? '',
          description: p.description ?? '',
          totalPrice: p.totalPrice?.toString() ?? '',
          pricePerCent: p.pricePerCent?.toString() ?? '',
          areaInCents: p.areaInCents?.toString() ?? '',
          city: p.city ?? '',
          address: p.address ?? '',
          pinCode: p.pinCode ?? '',
          propertyType: p.propertyType ?? 'open_land',
          bedrooms: p.bedrooms?.toString() ?? '',
          bathrooms: p.bathrooms?.toString() ?? '',
          roadAccess: !!p.roadAccess,
          isFeatured: !!p.isFeatured,
          isVerified: !!p.isVerified,
          legalStatus: p.legalStatus ?? '',
          // nearbyLandmarks is string[] on the API, joined for the
          // single-line textarea-style input the form uses.
          nearbyLandmarks: (p.nearbyLandmarks ?? []).join(', '),
          features: p.features ?? [],
          latitude: p.latitude?.toString() ?? '',
          longitude: p.longitude?.toString() ?? '',
          marketingPlan: p.marketingPlan ?? 'Free',
          // Owner/seller contact — surfaced via the DTO's SubmittedBy* fields.
          submitterName: p.submittedByName ?? '',
          submitterPhone: p.submittedByPhone ?? '',
          submitterEmail: p.submittedByEmail ?? '',
        })
      })
      .catch((err) => {
        console.error('Failed to load property for edit', err)
        setSaveError(`Couldn't load property #${id}. It may have been deleted.`)
      })
    return () => { cancelled = true }
  }, [isEditMode, id])

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [field]: value }))
    // Clear field-specific error as user types
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const markTouched = (field: keyof FormState) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  // Live re-validate after submit attempt
  useEffect(() => {
    if (submitAttempted) {
      setErrors(validate(form))
    }
  }, [form, submitAttempted])

  // Auto-calculate price-per-cent when total + area are entered
  useEffect(() => {
    const total = Number(form.totalPrice)
    const cents = Number(form.areaInCents)
    if (total > 0 && cents > 0) {
      const perCent = Math.round(total / cents)
      // Only auto-fill if user hasn't manually entered something different
      if (!form.pricePerCent || Number(form.pricePerCent) === 0) {
        setForm(f => ({ ...f, pricePerCent: String(perCent) }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.totalPrice, form.areaInCents])

  const toggleFeature = (f: string) =>
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(f) ? prev.features.filter((x) => x !== f) : [...prev.features, f],
    }))

  const handleImagesAdd = (files: FileList | null) => {
    if (!files) return
    const newImgs = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
    }))
    setImages(prev => [...prev, ...newImgs])
  }

  const removeImage = (id: string) =>
    setImages(prev => {
      const target = prev.find(i => i.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter(i => i.id !== id)
    })

  const moveImage = (from: number, to: number) => {
    setImages(prev => {
      if (to < 0 || to >= prev.length) return prev
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)

    const errs = validate(form)
    setErrors(errs)

    if (Object.keys(errs).length > 0) {
      // Mark all errored fields as touched
      const newTouched: typeof touched = {}
      Object.keys(errs).forEach((k) => { newTouched[k as keyof FormState] = true })
      setTouched((prev) => ({ ...prev, ...newTouched }))

      // Scroll to the section containing the first error
      const firstField = Object.keys(errs)[0] as keyof FormState
      const sectionId = FIELD_SECTION[firstField] ?? 'basic'
      sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(sectionId)
      return
    }

    setSaving(true)
    setSaveError(null)

    // 1) Upload each pending image. Sequential so a flaky line doesn't
    //    spawn ten concurrent multipart requests.
    let imageUrls: string[] = []
    if (images.length > 0) {
      setUploadProgress({ done: 0, total: images.length })
      try {
        for (let i = 0; i < images.length; i++) {
          const { url } = await uploadsApi.propertyImage(images[i].file)
          imageUrls.push(url)
          setUploadProgress({ done: i + 1, total: images.length })
        }
      } catch (err) {
        setUploadProgress(null)
        setSaving(false)
        setSaveError('Image upload failed. Please retry.')
        return
      }
      setUploadProgress(null)
    }

    // 2) Persist — PUT in edit mode, POST when creating a new listing.
    //    Both endpoints accept the same field shape; the backend treats
    //    a null/missing field as "leave unchanged" on update.
    try {
      const nearbyLandmarksArr = form.nearbyLandmarks
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
      if (isEditMode && id) {
        await propertiesApi.update(Number(id), {
          serialNo: form.serialNo.trim() || null,
          title: form.title,
          description: form.description,
          totalPrice: Number(form.totalPrice) || 0,
          pricePerCent: form.pricePerCent ? Number(form.pricePerCent) : undefined,
          areaInCents: Number(form.areaInCents) || 0,
          address: form.address,
          city: form.city,
          pinCode: form.pinCode,
          propertyType: form.propertyType,
          // For edit, only overwrite images when the admin actually
          // uploaded new ones — otherwise we'd wipe the existing gallery.
          ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
          features: form.features,
          nearbyLandmarks: nearbyLandmarksArr,
          legalStatus: form.legalStatus || undefined,
          roadAccess: form.roadAccess,
          isFeatured: form.isFeatured,
          isVerified: form.isVerified,
          marketingPlan: form.marketingPlan,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
          // Owner / seller contact — send the (trimmed) values so admins can
          // correct them; "" clears a field on the backend.
          submitterName: form.submitterName.trim(),
          submitterPhone: form.submitterPhone.trim(),
          submitterEmail: form.submitterEmail.trim(),
        } as PropertyUpdate)
      } else {
        // AddPropertyPage is admin-only. The Owner / Seller Contact section
        // feeds these fields; when left blank we fall back to an internal
        // "Admin entry" marker so the listing still has a submitter.
        const payload: PropertySubmission = {
          serialNo: form.serialNo.trim() || undefined,
          title: form.title,
          description: form.description,
          totalPrice: Number(form.totalPrice) || 0,
          pricePerCent: form.pricePerCent ? Number(form.pricePerCent) : undefined,
          areaInCents: Number(form.areaInCents) || 0,
          address: form.address,
          city: form.city,
          district: 'Kanyakumari',
          state: 'Tamil Nadu',
          pinCode: form.pinCode,
          propertyType: form.propertyType,
          status: 'for_sale',
          features: form.features,
          images: imageUrls,
          legalStatus: form.legalStatus || undefined,
          roadAccess: form.roadAccess,
          marketingPlan: form.marketingPlan,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
          submitterName: form.submitterName.trim() || 'Admin entry',
          submitterPhone: form.submitterPhone.trim(),
          submitterEmail: form.submitterEmail.trim() || undefined,
        }
        await propertiesApi.submit(payload)
      }
      setSaving(false)
      setSaved(true)
      setTimeout(() => navigate('/admin/properties'), 1500)
    } catch (err) {
      setSaving(false)
      setSaveError('Failed to save the property. Please check the fields and retry.')
    }
  }

  // Whether to show an error for a given field
  const errorFor = (field: keyof FormState): string | undefined => {
    if (!errors[field]) return undefined
    if (submitAttempted || touched[field]) return errors[field]
    return undefined
  }

  // Progress %
  const progress = useMemo(() => {
    const required = SECTIONS.filter(s => !s.isOptional)
    const done = required.filter(s => s.isComplete(form)).length
    return Math.round((done / required.length) * 100)
  }, [form])

  // Selected type meta
  const typeMeta = PROPERTY_TYPES.find(t => t.value === form.propertyType)!

  // Scroll-to-section
  const goTo = (id: string) => {
    setActiveSection(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (saved) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse"
            style={{ backgroundColor: 'rgba(106,151,57,0.1)', color: '#6A9739' }}>
            <Check className="w-7 h-7" strokeWidth={3} />
          </div>
          <p className="font-bold text-gray-900 text-lg">{isEditMode ? 'Property Updated!' : 'Property Added!'}</p>
          <p className="text-sm text-gray-500 mt-1">Redirecting to properties list…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-32">
      {/* === Header === */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/admin/properties')}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {isEditMode ? `Edit Property #${id}` : 'Add New Property'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditMode ? 'Update the property details below' : 'Fill in the details to list a new land property'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowPreview(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
            <Eye className="w-4 h-4" /> Preview
          </button>
        </div>
      </div>

      {/* === Progress bar === */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Listing Completeness</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold tracking-tight" style={{ color: progress === 100 ? '#6A9739' : '#FF5A5F' }}>
                {progress}%
              </span>
              <span className="text-xs text-gray-400">
                {progress === 100 ? '· Ready to publish' : '· Required fields remaining'}
              </span>
            </div>
          </div>
          {progress === 100 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
              <Check className="w-3.5 h-3.5" /> Complete
            </div>
          )}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden bg-gray-100">
          <div className="h-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: progress === 100
                ? 'linear-gradient(90deg, #6A9739 0%, #8BC34A 100%)'
                : 'linear-gradient(90deg, #FF5A5F 0%, #FFA0A3 100%)',
            }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* === Left: Section nav === */}
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2 lg:sticky lg:top-6">
            {SECTIONS.map(s => {
              const Icon = s.icon
              const complete = s.isComplete(form)
              const isActive = activeSection === s.id
              const hasError = submitAttempted && Object.entries(errors).some(([field]) =>
                FIELD_SECTION[field as keyof FormState] === s.id,
              )
              return (
                <button key={s.id} type="button" onClick={() => goTo(s.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={isActive
                    ? { backgroundColor: 'rgba(106,151,57,0.08)', color: '#6A9739' }
                    : hasError
                      ? { color: '#DC2626' }
                      : { color: '#374151' }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#F8F6F3' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{s.label}</span>
                  {hasError ? (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#DC2626' }}>
                      <AlertCircle className="w-3 h-3 text-white" strokeWidth={2.5} />
                    </div>
                  ) : complete ? (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#6A9739' }}>
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  ) : !s.isOptional ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider shrink-0" style={{ color: '#FF5A5F' }}>
                      Required
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </aside>

        {/* === Right: Form === */}
        <form onSubmit={handleSave} className="lg:col-span-9 space-y-5" noValidate>
          {/* Error summary banner */}
          {submitAttempted && Object.keys(errors).length > 0 && (
            <div className="rounded-xl p-4 border-2 flex gap-3"
              style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#DC2626', color: 'white' }}>
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: '#991B1B' }}>
                  Please fix {Object.keys(errors).length} {Object.keys(errors).length === 1 ? 'issue' : 'issues'} before saving
                </p>
                <ul className="text-xs mt-1 space-y-0.5" style={{ color: '#B91C1C' }}>
                  {Object.entries(errors).slice(0, 4).map(([field, msg]) => (
                    <li key={field}>• {msg}</li>
                  ))}
                  {Object.keys(errors).length > 4 && (
                    <li className="font-medium">+ {Object.keys(errors).length - 4} more…</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <Section title="Basic Information"
            desc="Headline and the description buyers see first"
            icon={Info}
            sectionRef={(el) => (sectionRefs.current.basic = el)}
            id="basic">

            <Field label="Serial No"
              hint="Optional reference code for tracking — e.g. JFL-2026-001">
              <input type="text" value={form.serialNo}
                onChange={(e) => set('serialNo', e.target.value)}
                placeholder="e.g. JFL-2026-001"
                className="input-field" maxLength={50} />
            </Field>

            <Field label="Property Title" required
              hint="A clear, specific title performs best (include location and area)"
              error={errorFor('title')}>
              <input type="text" value={form.title}
                onChange={(e) => set('title', e.target.value)}
                onBlur={() => markTouched('title')}
                placeholder="e.g. 15 Cents Prime Land Near Highway – Nagercoil"
                className="input-field" maxLength={100}
                style={errorFor('title') ? { borderColor: '#DC2626' } : undefined} />
              <CharCounter value={form.title} max={100} />
            </Field>

            <Field label="Description" required error={errorFor('description')}>
              <textarea rows={5} value={form.description}
                onChange={(e) => set('description', e.target.value)}
                onBlur={() => markTouched('description')}
                placeholder="Describe the property — surroundings, legal status, development potential, why it stands out..."
                className="input-field resize-none" maxLength={1000}
                style={errorFor('description') ? { borderColor: '#DC2626' } : undefined} />
              <CharCounter value={form.description} max={1000} />
            </Field>

            <Field label="Property Type" required>
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

            <Field label="Legal Status" hint="What documents are available?">
              <input type="text" value={form.legalStatus}
                onChange={(e) => set('legalStatus', e.target.value)}
                placeholder="e.g. Clear — EC, Patta, Chitta available"
                className="input-field" />
            </Field>
          </Section>

          {/* Pricing & Area */}
          <Section title="Pricing & Area"
            desc="Total price and plot size — auto-calculates per-cent rate"
            icon={IndianRupee}
            sectionRef={(el) => (sectionRefs.current.pricing = el)}
            id="pricing">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Area (in Cents)" required error={errorFor('areaInCents')}>
                <div className="relative">
                  {/* step="any" — admin can enter 1.8 / 7.25 / etc. The
                      default step of 1 was rejecting any non-integer value
                      at browser-validity time even though the field is a
                      decimal in the API. */}
                  <input type="number" min="0.01" step="any" value={form.areaInCents}
                    onChange={(e) => set('areaInCents', e.target.value)}
                    onBlur={() => markTouched('areaInCents')}
                    placeholder="15"
                    className="input-field pr-14"
                    style={errorFor('areaInCents') ? { borderColor: '#DC2626' } : undefined} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">cents</span>
                </div>
              </Field>

              <Field label="Total Price" required error={errorFor('totalPrice')}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input type="number" min="0" value={form.totalPrice}
                    onChange={(e) => set('totalPrice', e.target.value)}
                    onBlur={() => markTouched('totalPrice')}
                    placeholder="2250000"
                    className="input-field pl-7"
                    style={errorFor('totalPrice') ? { borderColor: '#DC2626' } : undefined} />
                </div>
                {form.totalPrice && !errorFor('totalPrice') && (
                  <p className="text-xs mt-1.5 font-semibold" style={{ color: '#6A9739' }}>
                    {formatLakhs(form.totalPrice)}
                  </p>
                )}
              </Field>

              <Field label="Price per Cent" hint="Auto-calculated">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input type="number" min="0" value={form.pricePerCent}
                    onChange={(e) => set('pricePerCent', e.target.value)}
                    placeholder="150000"
                    className="input-field pl-7"
                    style={{ backgroundColor: '#FAFAF8' }} />
                </div>
                {form.pricePerCent && (
                  <p className="text-xs mt-1.5 text-gray-500">
                    {formatLakhs(form.pricePerCent)}/cent
                  </p>
                )}
              </Field>
            </div>

            {/* Pricing summary card */}
            {form.totalPrice && form.areaInCents && (
              <div className="mt-2 p-4 rounded-xl border flex items-center gap-4"
                style={{ backgroundColor: 'rgba(255,90,95,0.04)', borderColor: 'rgba(255,90,95,0.15)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#FF5A5F', color: 'white' }}>
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Listing Price</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold tracking-tight" style={{ color: '#111111' }}>
                      {formatLakhs(form.totalPrice)}
                    </span>
                    <span className="text-sm text-gray-500">
                      for {form.areaInCents} cents · {formatLakhs(form.pricePerCent)}/cent
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* Location */}
          <Section title="Location"
            desc="Where the property is located"
            icon={MapPin}
            sectionRef={(el) => (sectionRefs.current.location = el)}
            id="location">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="City / Town" required error={errorFor('city')}>
                <select value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  onBlur={() => markTouched('city')}
                  className="input-field"
                  style={errorFor('city') ? { borderColor: '#DC2626' } : undefined}>
                  <option value="">Select city</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address / Locality">
                  <input type="text" value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="Street, area, or local name"
                    className="input-field" />
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="PIN Code" error={errorFor('pinCode')}>
                <input type="text" value={form.pinCode}
                  onChange={(e) => set('pinCode', e.target.value)}
                  onBlur={() => markTouched('pinCode')}
                  placeholder="629 001"
                  className="input-field" maxLength={7}
                  style={errorFor('pinCode') ? { borderColor: '#DC2626' } : undefined} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Nearby Landmarks" hint="Comma-separated, with distance">
                  <input type="text" value={form.nearbyLandmarks}
                    onChange={(e) => set('nearbyLandmarks', e.target.value)}
                    placeholder="e.g. NH 44 (200m), Railway Station (2km)"
                    className="input-field" />
                </Field>
              </div>
            </div>

            {/* Google Maps location picker */}
            <Field
              label="Map Location"
              hint="Optional — pin the plot on the map so buyers can see exactly where it is"
              error={errorFor('latitude') || errorFor('longitude')}
            >
              <LocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={(lat, lng) => {
                  setForm((f) => ({ ...f, latitude: lat, longitude: lng }))
                  // Clear lat/lng errors as user picks
                  setErrors((prev) => {
                    if (!prev.latitude && !prev.longitude) return prev
                    const next = { ...prev }
                    delete next.latitude
                    delete next.longitude
                    return next
                  })
                }}
              />
            </Field>

            {form.propertyType === 'land_with_building' && (
              <div className="mt-4 p-4 rounded-xl border" style={{ backgroundColor: '#FAFAF8', borderColor: '#EAEAE5' }}>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Building Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Bedrooms" error={errorFor('bedrooms')}>
                    <input type="number" min="1" value={form.bedrooms}
                      onChange={(e) => set('bedrooms', e.target.value)}
                      onBlur={() => markTouched('bedrooms')}
                      className="input-field" placeholder="3"
                      style={errorFor('bedrooms') ? { borderColor: '#DC2626' } : undefined} />
                  </Field>
                  <Field label="Bathrooms" error={errorFor('bathrooms')}>
                    <input type="number" min="1" value={form.bathrooms}
                      onChange={(e) => set('bathrooms', e.target.value)}
                      onBlur={() => markTouched('bathrooms')}
                      className="input-field" placeholder="2"
                      style={errorFor('bathrooms') ? { borderColor: '#DC2626' } : undefined} />
                  </Field>
                </div>
              </div>
            )}
          </Section>

          {/* Features */}
          <Section title="Features & Amenities"
            desc={`Highlight what makes this plot stand out (${form.features.length} selected)`}
            icon={Sparkles}
            sectionRef={(el) => (sectionRefs.current.features = el)}
            id="features">
            <div className="flex flex-wrap gap-2">
              {FEATURES_OPTIONS.map((f) => {
                const isActive = form.features.includes(f)
                return (
                  <button key={f} type="button" onClick={() => toggleFeature(f)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all"
                    style={isActive
                      ? { backgroundColor: '#6A9739', borderColor: '#6A9739', color: 'white' }
                      : { borderColor: '#e5e7eb', color: '#4b5563' }}>
                    {isActive && <Check className="w-3 h-3" strokeWidth={3} />}
                    {f}
                  </button>
                )
              })}
            </div>
          </Section>

          {/* Marketing plan */}
          <Section
            title="Marketing Plan"
            desc="Free listing vs Video Promotion (2% brokerage on sale)"
            icon={Video}
            sectionRef={(el) => (sectionRefs.current.marketing = el)}
            id="marketing"
            badge={form.marketingPlan === 'VideoPromotion' ? 'Video · 2%' : 'Free'}>
            <MarketingPlanPicker
              value={form.marketingPlan}
              onChange={(plan) => set('marketingPlan', plan)}
              totalPriceStr={form.totalPrice}
            />
          </Section>

          {/* Images */}
          <Section title="Images"
            desc={`${images.length} image${images.length !== 1 ? 's' : ''} · the first one is used as the cover`}
            icon={ImageIcon}
            sectionRef={(el) => (sectionRefs.current.images = el)}
            id="images">

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                {images.map((img, idx) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />

                    {idx === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 text-white"
                        style={{ backgroundColor: '#FF5A5F' }}>
                        <Star className="w-2.5 h-2.5" fill="currentColor" /> Cover
                      </div>
                    )}

                    {/* Hover actions */}
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
                onChange={(e) => handleImagesAdd(e.target.files)} />
              <Upload className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">
                {images.length === 0 ? 'Click to upload property images' : 'Add more images'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 5MB each · You can select multiple</p>
            </label>
          </Section>

          {/* Documents */}
          <Section title="Documents"
            desc="EC, Patta, Chitta, Layout plans — verified files inspire buyer confidence"
            icon={FolderOpen}
            sectionRef={(el) => (sectionRefs.current.documents = el)}
            id="documents"
            badge={documents.length > 0 ? `${documents.length} attached` : undefined}>
            <PropertyDocumentsEditor documents={documents} onChange={setDocuments} />
          </Section>

          {/* Options */}
          <Section title="Visibility & Options"
            desc="Featured listings appear first on the home page"
            icon={SettingsIcon}
            sectionRef={(el) => (sectionRefs.current.options = el)}
            id="options">

            <ToggleRow
              checked={form.isFeatured}
              onChange={(v) => set('isFeatured', v)}
              label="Mark as Featured"
              desc="Show this property prominently on the home page and at the top of listings"
              icon={Star}
              accent="#FF5A5F" />

            <ToggleRow
              checked={form.isVerified}
              onChange={(v) => set('isVerified', v)}
              label="Mark as Verified"
              desc="Add a verified badge — only after our agent has inspected the property in person"
              icon={Check}
              accent="#6A9739" />

            <ToggleRow
              checked={form.roadAccess}
              onChange={(v) => set('roadAccess', v)}
              label="Road Access Available"
              desc="The plot has direct vehicle access from a public road"
              icon={MapPin}
              accent="#293237" />
          </Section>

          {/* Owner / Seller Contact — captured for both new and existing
              listings. Optional: leave blank for internal admin entries
              (the owner name then defaults to "Admin entry"). */}
          {(
            <Section title="Owner / Seller Contact"
              desc="Who owns this listing — shown to buyers on the property page and to admins in pending approvals"
              icon={User}
              sectionRef={(el) => (sectionRefs.current.owner = el)}
              id="owner">
              <Field label="Owner Name" hint="The person selling this property">
                <input type="text" value={form.submitterName}
                  onChange={(e) => set('submitterName', e.target.value)}
                  placeholder="e.g. Satheesh"
                  className="input-field" />
              </Field>
              <Field label="Owner Phone" hint="Buyers can call this number directly">
                <input type="tel" inputMode="tel" value={form.submitterPhone}
                  onChange={(e) => set('submitterPhone', e.target.value)}
                  placeholder="e.g. 7902542889"
                  className="input-field" />
              </Field>
              <Field label="Owner Email" hint="Used for buyer enquiries and confirmation emails">
                <input type="email" inputMode="email" value={form.submitterEmail}
                  onChange={(e) => set('submitterEmail', e.target.value)}
                  placeholder="e.g. owner@example.com"
                  className="input-field" />
              </Field>
            </Section>
          )}
        </form>
      </div>

      {/* === Sticky save bar === */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 border-t border-gray-200 bg-white/95 backdrop-blur shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: typeMeta.color, color: 'white' }}>
              <typeMeta.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: '#111111' }}>
                {form.title || (isEditMode ? `Property #${id}` : 'New property')}
              </div>
              <div className="text-[11px] text-gray-500">
                {form.totalPrice && form.areaInCents
                  ? <>{formatLakhs(form.totalPrice)} · {form.areaInCents} cents{form.city ? ` · ${form.city}` : ''}</>
                  : 'Pricing not set'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {submitAttempted && Object.keys(errors).length > 0 ? (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#DC2626' }}>
                <AlertCircle className="w-3.5 h-3.5" />
                {Object.keys(errors).length} validation {Object.keys(errors).length === 1 ? 'error' : 'errors'}
              </div>
            ) : progress < 100 ? (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium" style={{ color: '#FF5A5F' }}>
                <AlertCircle className="w-3.5 h-3.5" />
                Required fields missing
              </div>
            ) : null}
            <button type="button" onClick={() => navigate('/admin/properties')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#6A9739' }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#547a2d')}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = '#6A9739')}>
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {uploadProgress
                    ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…`
                    : 'Saving…'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Update Property' : 'Save & Publish'}
                </>
              )}
            </button>
            {saveError && (
              <p className="ml-3 text-xs flex items-center gap-1" style={{ color: '#B91C1C' }}>
                <AlertCircle className="w-3.5 h-3.5" /> {saveError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* === Live preview modal === */}
      {showPreview && (
        <PreviewModal form={form} typeMeta={typeMeta} images={images}
          onClose={() => setShowPreview(false)} />
      )}
    </div>
  )
}

/* ============================== Helpers ============================== */

function Section({
  title, desc, icon: Icon, children, sectionRef, id, badge,
}: {
  title: string
  desc?: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  sectionRef?: (el: HTMLDivElement | null) => void
  id?: string
  badge?: string
}) {
  return (
    <div ref={sectionRef} id={id}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-6">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(106,151,57,0.08)', color: '#6A9739' }}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-tight">{title}</h3>
          {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
        </div>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0"
            style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, required, hint, error, children }: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between gap-2">
        <span>
          {label}{required && <span style={{ color: '#FF5A5F' }} className="ml-0.5">*</span>}
        </span>
        {hint && !error && <span className="text-[11px] font-normal text-gray-400">{hint}</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1.5 flex items-center gap-1 font-medium" style={{ color: '#DC2626' }}>
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value.length
  const ratio = len / max
  const color = ratio >= 1 ? '#DC2626' : ratio > 0.85 ? '#B45309' : '#9CA3AF'
  return (
    <p className="text-[11px] mt-1 text-right" style={{ color }}>
      {len} / {max}
    </p>
  )
}

function ToggleRow({ checked, onChange, label, desc, icon: Icon, accent }: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <button type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left"
      style={checked
        ? { backgroundColor: `${accent}10`, borderColor: `${accent}40` }
        : { backgroundColor: 'white', borderColor: '#e5e7eb' }}
      onMouseEnter={(e) => { if (!checked) e.currentTarget.style.backgroundColor = '#FAFAF8' }}
      onMouseLeave={(e) => { if (!checked) e.currentTarget.style.backgroundColor = 'white' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
        style={{ backgroundColor: checked ? accent : '#F3F4F6', color: checked ? 'white' : '#9CA3AF' }}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold" style={{ color: '#111111' }}>{label}</div>
        <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
      </div>
      <div className="w-11 h-6 rounded-full transition-colors relative shrink-0"
        style={{ backgroundColor: checked ? accent : '#E5E7EB' }}>
        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
      </div>
    </button>
  )
}

/* --------------------------- Preview modal --------------------------- */

function PreviewModal({ form, typeMeta, images, onClose }: {
  form: FormState
  typeMeta: typeof PROPERTY_TYPES[number]
  images: { id: string; url: string }[]
  onClose: () => void
}) {
  const TypeIcon = typeMeta.icon
  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="text-sm font-bold flex items-center gap-2">
            <Eye className="w-4 h-4" style={{ color: '#FF5A5F' }} />
            Listing Preview
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="aspect-video bg-gray-100 relative">
            {images[0] ? (
              <img src={images[0].url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-gray-300" />
              </div>
            )}
            <div className="absolute top-3 left-3 inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: typeMeta.color }}>
              <TypeIcon className="w-3 h-3" />
              {typeMeta.label}
            </div>
            {form.isFeatured && (
              <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-yellow-500 text-white">
                <Star className="w-3 h-3" fill="currentColor" /> Featured
              </div>
            )}
          </div>

          <div className="p-5">
            <h3 className="font-bold text-gray-900 leading-snug">
              {form.title || 'Property Title'}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <MapPin className="w-3 h-3" />
              {form.city || 'City'}, Kanyakumari Dist.
            </div>

            <div className="flex items-center justify-between mt-4 pb-3 border-b border-gray-100">
              <div className="text-xl font-bold" style={{ color: '#FF5A5F' }}>
                {form.totalPrice ? formatLakhs(form.totalPrice) : '—'}
              </div>
              <div className="text-xs px-2 py-1 rounded-md font-medium"
                style={{ backgroundColor: 'rgba(106,151,57,0.1)', color: '#6A9739' }}>
                {form.areaInCents || '—'} cents
              </div>
            </div>

            {form.description && (
              <p className="text-sm text-gray-600 mt-3 line-clamp-3">{form.description}</p>
            )}

            {form.features.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {form.features.slice(0, 6).map(f => (
                  <span key={f} className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#FAFAF8', color: '#374151' }}>{f}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
