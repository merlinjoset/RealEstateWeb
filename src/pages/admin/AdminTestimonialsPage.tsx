import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff, Star, X, Save,
  Video as VideoIcon, Play, MapPin, Upload, Link as LinkIcon,
  Loader2, AlertCircle,
} from 'lucide-react'
import {
  testimonialsApi,
  type Testimonial,
  type TestimonialPayload,
} from '../../services/api'
import { classifyVideoUrl } from '../../utils/video'

interface FormState {
  name: string
  location: string
  propertyDetail: string
  rating: number
  excerpt: string
  thumbnail: string
  videoUrl: string
  duration: string
  isPublished: boolean
}

const EMPTY_FORM: FormState = {
  name: '', location: '', propertyDetail: '', rating: 5, excerpt: '',
  thumbnail: '', videoUrl: '', duration: '', isPublished: true,
}

export default function AdminTestimonialsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [previewing, setPreviewing] = useState<Testimonial | null>(null)

  // ── Live query (admin = include drafts) ───────────────────────────────
  const query = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: () => testimonialsApi.getAll(),
  })

  const items = query.data ?? []

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.excerpt.toLowerCase().includes(q),
    )
  }, [items, search])

  // ── Mutations ─────────────────────────────────────────────────────────
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
    queryClient.invalidateQueries({ queryKey: ['testimonials', 'published'] })
  }

  const createMutation = useMutation({
    mutationFn: (payload: TestimonialPayload) => testimonialsApi.create(payload),
    onSuccess: () => { invalidate(); closeForm() },
    onError: (err: any) => setFormError(err?.response?.data?.message ?? 'Failed to create testimonial'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TestimonialPayload }) =>
      testimonialsApi.update(id, payload),
    onSuccess: () => { invalidate(); closeForm() },
    onError: (err: any) => setFormError(err?.response?.data?.message ?? 'Failed to update testimonial'),
  })

  const togglePublishMutation = useMutation({
    mutationFn: (id: number) => testimonialsApi.togglePublished(id),
    onSuccess: () => invalidate(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => testimonialsApi.delete(id),
    onSuccess: () => { invalidate(); setDeleteId(null) },
  })

  // ── Handlers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id)
    setForm({
      name: t.name,
      location: t.location,
      propertyDetail: t.propertyDetail ?? '',
      rating: t.rating,
      excerpt: t.excerpt,
      thumbnail: t.thumbnail ?? '',
      videoUrl: t.videoUrl ?? '',
      duration: t.duration ?? '',
      isPublished: t.isPublished,
    })
    setFormError(null)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const payload: TestimonialPayload = {
      name: form.name.trim(),
      location: form.location.trim(),
      propertyDetail: form.propertyDetail.trim() || null,
      rating: form.rating,
      excerpt: form.excerpt.trim(),
      thumbnail: form.thumbnail.trim() || null,
      videoUrl: form.videoUrl.trim() || null,
      duration: form.duration.trim() || null,
      isPublished: form.isPublished,
      order: editingId ? items.find(i => i.id === editingId)?.order ?? 0 : 0,
    }

    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter(t => t.isPublished).length,
    drafts: items.filter(t => !t.isPublished).length,
    avgRating: items.length
      ? (items.reduce((s, t) => s + t.rating, 0) / items.length).toFixed(1)
      : '0',
  }), [items])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Testimonials</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {stats.total} total · {stats.published} published
            {query.isFetching && <span className="ml-2 inline-flex items-center gap-1" style={{ color: '#6A9739' }}>
              <Loader2 className="w-3 h-3 animate-spin" /> updating
            </span>}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
          style={{ backgroundColor: '#EA2D34' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#EA2D34')}
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',      value: stats.total,     color: '#111111' },
          { label: 'Published',  value: stats.published, color: '#6A9739' },
          { label: 'Drafts',     value: stats.drafts,    color: '#F59E0B' },
          { label: 'Avg Rating', value: stats.avgRating, color: '#EA2D34' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold tracking-tight" style={{ color }}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Card grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 max-w-sm">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or location..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
        </div>

        {query.isLoading ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading testimonials…</p>
          </div>
        ) : query.isError ? (
          <div className="py-16 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-600">Failed to load testimonials.</p>
            <button onClick={() => query.refetch()}
              className="mt-3 text-xs font-semibold underline" style={{ color: '#EA2D34' }}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <VideoIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No testimonials found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filtered.map((t) => (
              <div key={t.id} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Video thumbnail */}
                <div className="relative aspect-video bg-gray-100 group cursor-pointer"
                  onClick={() => t.videoUrl && setPreviewing(t)}>
                  {t.thumbnail ? (
                    <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <VideoIcon className="w-8 h-8" />
                    </div>
                  )}

                  {t.videoUrl && (
                    <>
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/40"
                          style={{ backgroundColor: 'rgba(255,90,95,0.92)' }}>
                          <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Status pill */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
                    style={t.isPublished
                      ? { backgroundColor: 'rgba(106,151,57,0.95)', color: 'white' }
                      : { backgroundColor: 'rgba(245,158,11,0.95)', color: 'white' }}>
                    {t.isPublished ? 'Live' : 'Draft'}
                  </div>

                  {t.duration && t.duration !== '0:00' && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                      {t.duration}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="flex gap-0.5 shrink-0">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3" style={{ fill: '#EA2D34', color: '#EA2D34' }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <MapPin className="w-3 h-3" /> {t.location}
                    {t.propertyDetail && <> · <span>{t.propertyDetail}</span></>}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3">"{t.excerpt}"</p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400">
                      {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => togglePublishMutation.mutate(t.id)}
                        disabled={togglePublishMutation.isPending}
                        title={t.isPublished ? 'Unpublish' : 'Publish'}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50">
                        {t.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => openEdit(t)}
                        title="Edit"
                        className="p-1.5 text-gray-400 hover:text-[#6A9739] hover:bg-[rgba(106,151,57,0.08)] rounded-md transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(t.id)}
                        title="Delete"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={closeForm}>
          <form onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full shadow-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingId ? 'Update the testimonial details below' : 'Record a client story to feature on the home page'}
                </p>
              </div>
              <button type="button" onClick={closeForm} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name + Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name *</label>
                  <input required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rajan Kumar"
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
                  <div className="flex gap-1 pt-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}>
                        <Star className="w-6 h-6 transition-colors"
                          style={{
                            fill: n <= form.rating ? '#EA2D34' : '#E5E7EB',
                            color: n <= form.rating ? '#EA2D34' : '#E5E7EB',
                          }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location + Property detail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Location *</label>
                  <input required value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Nagercoil"
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Property Detail</label>
                  <input value={form.propertyDetail}
                    onChange={(e) => setForm({ ...form, propertyDetail: e.target.value })}
                    placeholder="e.g. 15 cents · Open Land"
                    className="input-field" />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quote / Excerpt *</label>
                <textarea required rows={3}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="What did the client say about their experience?"
                  className="input-field resize-none" />
                <p className="text-xs text-gray-400 mt-1">Shown on the home page video card. Keep it under 150 characters for best layout.</p>
              </div>

              {/* Video asset */}
              <div className="space-y-4 p-4 rounded-xl border border-gray-100" style={{ backgroundColor: '#FAFAF8' }}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Video Asset</p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5" /> Video URL
                  </label>
                  <input value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    placeholder="YouTube, YouTube Shorts, Instagram Reel / Post, or direct MP4"
                    className="input-field" />
                  <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                    Paste the full share URL — e.g.{' '}
                    <code className="px-1 py-0.5 bg-gray-100 rounded">youtube.com/shorts/abc123</code>,{' '}
                    <code className="px-1 py-0.5 bg-gray-100 rounded">instagram.com/reel/xyz</code>,{' '}
                    or a direct{' '}
                    <code className="px-1 py-0.5 bg-gray-100 rounded">.mp4</code> link.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Thumbnail URL
                    </label>
                    <input value={form.thumbnail}
                      onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                      placeholder="https://… or upload (TODO)"
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
                    <input value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      placeholder="e.g. 1:24"
                      className="input-field" />
                  </div>
                </div>

                {form.thumbnail && (
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-video max-w-xs">
                    <img src={form.thumbnail} alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                  </div>
                )}
              </div>

              {/* Publish toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50">
                <div onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
                  className="w-11 h-6 rounded-full transition-colors relative shrink-0"
                  style={{ backgroundColor: form.isPublished ? '#6A9739' : '#E5E7EB' }}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: form.isPublished ? 'translateX(22px)' : 'translateX(2px)' }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {form.isPublished ? 'Publish to home page' : 'Save as draft'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {form.isPublished
                      ? 'This testimonial will be visible to website visitors immediately.'
                      : 'Saved internally — will not be shown publicly until published.'}
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
              <button type="button" onClick={closeForm}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-ghost text-sm">
                Cancel
              </button>
              <button type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#EA2D34' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#EA2D34')}>
                {(createMutation.isPending || updateMutation.isPending)
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><Save className="w-4 h-4" /> {editingId ? 'Update Testimonial' : 'Add Testimonial'}</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Testimonial?</h3>
            <p className="text-gray-500 text-sm mb-5">
              This will remove the testimonial permanently. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                disabled={deleteMutation.isPending}
                className="flex-1 btn-ghost border border-gray-200">
                Cancel
              </button>
              <button onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60">
                {deleteMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                  : <><Trash2 className="w-4 h-4" /> Delete</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video preview modal */}
      {previewing && (
        <div className="fixed inset-0 bg-black/85 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewing(null)}>
          <button onClick={() => setPreviewing(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm">
            <X className="w-5 h-5" />
          </button>
          {(() => {
            const source = classifyVideoUrl(previewing.videoUrl)
            const isPortrait =
              (source.kind === 'youtube'   && source.portrait) ||
              (source.kind === 'instagram' && source.portrait)
            const modalWidth = isPortrait ? 'max-w-md' : 'max-w-3xl'
            const aspectClass = source.kind === 'instagram'
              ? (source.portrait ? 'aspect-[9/17]' : 'aspect-[4/5]')
              : (isPortrait ? 'aspect-[9/16]' : 'aspect-video')
            return (
              <div onClick={(e) => e.stopPropagation()} className={`w-full ${modalWidth} bg-black rounded-2xl overflow-hidden`}>
                {source.kind === 'youtube' || source.kind === 'instagram' ? (
                  <iframe
                    src={source.src}
                    title={previewing.name}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className={`w-full ${aspectClass} border-0`}
                  />
                ) : (
                  <video src={source.src} poster={previewing.thumbnail ?? ''} controls autoPlay
                    className={`w-full ${aspectClass}`} />
                )}
                <div className="p-4 text-white">
                  <div className="font-bold">{previewing.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {previewing.location}{previewing.propertyDetail && ` · ${previewing.propertyDetail}`}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
