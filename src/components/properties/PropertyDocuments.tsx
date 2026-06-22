import { useState } from 'react'
import {
  FileText, Download, Eye, ExternalLink, Lock, Plus, Trash2, Upload,
  CheckCircle2, X, FileImage,
} from 'lucide-react'
import type { PropertyDocument, DocumentType } from '../../types'

export const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  ec: 'Encumbrance Certificate (EC)',
  patta: 'Patta',
  chitta: 'Chitta Extract',
  layout: 'Layout / Survey Plan',
  sale_deed: 'Sale Deed',
  tax_receipt: 'Property Tax Receipt',
  noc: 'No Objection Certificate',
  fmb: 'FMB Sketch',
  other: 'Other Document',
}

const DOC_TYPE_BADGE: Record<DocumentType, { bg: string; color: string }> = {
  ec:          { bg: 'rgba(255,90,95,0.10)',  color: '#EA2D34' },
  patta:       { bg: 'rgba(106,151,57,0.10)', color: '#6A9739' },
  chitta:      { bg: 'rgba(106,151,57,0.10)', color: '#6A9739' },
  layout:      { bg: 'rgba(41,50,55,0.08)',   color: '#293237' },
  sale_deed:   { bg: 'rgba(255,90,95,0.10)',  color: '#EA2D34' },
  tax_receipt: { bg: 'rgba(245,158,11,0.10)', color: '#B45309' },
  noc:         { bg: 'rgba(106,151,57,0.10)', color: '#6A9739' },
  fmb:         { bg: 'rgba(41,50,55,0.08)',   color: '#293237' },
  other:       { bg: 'rgba(107,114,128,0.10)', color: '#6B7280' },
}

function formatBytes(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function isImage(mime?: string) {
  return mime?.startsWith('image/') ?? false
}

interface ViewProps {
  documents: PropertyDocument[]
  /** When true, hides admin-only docs (default: true for buyer view) */
  publicOnly?: boolean
}

/**
 * Buyer-facing document list — read-only with view + download buttons.
 */
export function PropertyDocumentsView({ documents, publicOnly = true }: ViewProps) {
  const [previewing, setPreviewing] = useState<PropertyDocument | null>(null)

  const visible = publicOnly ? documents.filter(d => d.isPublic) : documents

  if (visible.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No documents have been published for this property yet.</p>
        <p className="text-xs text-gray-400 mt-1">Contact us — we'll share verified copies on request.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2.5">
        {visible.map((doc) => {
          const badge = DOC_TYPE_BADGE[doc.type]
          const Icon = isImage(doc.mimeType) ? FileImage : FileText

          return (
            <div key={doc.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all">
              {/* Doc icon */}
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: badge.bg, color: badge.color }}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                    style={{ backgroundColor: badge.bg, color: badge.color }}>
                    {DOC_TYPE_LABELS[doc.type]}
                  </span>
                  {doc.fileSize && (
                    <span className="text-[11px] text-gray-400">{formatBytes(doc.fileSize)}</span>
                  )}
                </div>
                <div className="font-medium text-gray-900 text-sm mt-0.5 line-clamp-1">{doc.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setPreviewing(doc)}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                  style={{ color: '#6A9739' }}
                  title="Preview document"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <a
                  href={doc.fileUrl}
                  download={doc.fileName}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                  style={{ color: '#EA2D34' }}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* Preview modal */}
      {previewing && (
        <DocumentPreview document={previewing} onClose={() => setPreviewing(null)} />
      )}
    </>
  )
}

/* --------------------------- Preview modal --------------------------- */

function DocumentPreview({ document, onClose }: { document: PropertyDocument; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm">
        <X className="w-5 h-5" />
      </button>

      <div onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate" style={{ color: '#111111' }}>{document.name}</div>
            <div className="text-xs text-gray-400">{DOC_TYPE_LABELS[document.type]}</div>
          </div>
          <a href={document.fileUrl} download={document.fileName}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
            style={{ backgroundColor: '#EA2D34' }}>
            <Download className="w-3.5 h-3.5" /> Download
          </a>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center min-h-[400px]">
          {isImage(document.mimeType) ? (
            <img src={document.fileUrl} alt={document.name} className="max-w-full max-h-full object-contain" />
          ) : document.mimeType === 'application/pdf' ? (
            <iframe src={document.fileUrl} title={document.name} className="w-full h-[70vh] border-0" />
          ) : (
            <div className="text-center p-10">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-3">Preview not available for this file type.</p>
              <a href={document.fileUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: '#EA2D34' }}>
                <ExternalLink className="w-4 h-4" /> Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* --------------------------- Admin editor --------------------------- */

interface EditorProps {
  documents: PropertyDocument[]
  onChange: (next: PropertyDocument[]) => void
  propertyId?: number
}

/**
 * Admin-side document manager — add / remove / toggle public.
 * Uses local file picker; produces blob URLs for preview (real upload to be wired to backend).
 */
export function PropertyDocumentsEditor({ documents, onChange, propertyId = 0 }: EditorProps) {
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<{
    type: DocumentType
    name: string
    file: File | null
    isPublic: boolean
  }>({ type: 'ec', name: '', file: null, isPublic: true })

  const reset = () => {
    setDraft({ type: 'ec', name: '', file: null, isPublic: true })
    setShowForm(false)
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.file) return

    const newDoc: PropertyDocument = {
      id: Math.max(0, ...documents.map(d => d.id)) + 1,
      propertyId,
      type: draft.type,
      name: draft.name || draft.file.name,
      fileName: draft.file.name,
      fileUrl: URL.createObjectURL(draft.file), // local preview URL — replace with backend URL on save
      fileSize: draft.file.size,
      mimeType: draft.file.type,
      isPublic: draft.isPublic,
      uploadedAt: new Date().toISOString(),
    }

    onChange([...documents, newDoc])
    reset()
  }

  const remove = (id: number) => onChange(documents.filter(d => d.id !== id))

  const togglePublic = (id: number) =>
    onChange(documents.map(d => d.id === id ? { ...d, isPublic: !d.isPublic } : d))

  return (
    <div className="space-y-3">
      {/* Existing docs */}
      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map(doc => {
            const badge = DOC_TYPE_BADGE[doc.type]
            const Icon = isImage(doc.mimeType) ? FileImage : FileText
            return (
              <div key={doc.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: badge.bg, color: badge.color }}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
                      style={{ backgroundColor: badge.bg, color: badge.color }}>
                      {DOC_TYPE_LABELS[doc.type]}
                    </span>
                    {!doc.isPublic && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide flex items-center gap-1"
                        style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#B45309' }}>
                        <Lock className="w-2.5 h-2.5" /> Admin-only
                      </span>
                    )}
                    {doc.fileSize && <span className="text-[11px] text-gray-400">{formatBytes(doc.fileSize)}</span>}
                  </div>
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">{doc.name}</div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => togglePublic(doc.id)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                    title={doc.isPublic ? 'Make admin-only' : 'Make public'}
                  >
                    {doc.isPublic ? <Eye className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(doc.id)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add new */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors"
          style={{ borderColor: '#CFD8DC', color: '#6A9739' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6A9739')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#CFD8DC')}
        >
          <Plus className="w-4 h-4" />
          Add document (EC, Patta, Chitta, Layout…)
        </button>
      ) : (
        <form onSubmit={handleAdd} className="rounded-xl border border-gray-200 p-4 space-y-3"
          style={{ backgroundColor: '#FAFAF8' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Upload Document</p>
            <button type="button" onClick={reset} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Document Type</label>
              <select
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as DocumentType })}
                className="input-field text-sm"
              >
                {(Object.keys(DOC_TYPE_LABELS) as DocumentType[]).map((k) => (
                  <option key={k} value={k}>{DOC_TYPE_LABELS[k]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Display Name (optional)</label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. EC for last 13 years"
                className="input-field text-sm"
              />
            </div>
          </div>

          {/* File picker */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">File (PDF or image)</label>
            <label className="flex items-center gap-3 px-3 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors"
              style={{ borderColor: draft.file ? '#6A9739' : '#CFD8DC', backgroundColor: 'white' }}>
              <Upload className="w-4 h-4 shrink-0" style={{ color: draft.file ? '#6A9739' : '#9CA3AF' }} />
              <div className="flex-1 min-w-0">
                {draft.file ? (
                  <>
                    <div className="text-sm font-medium text-gray-900 truncate">{draft.file.name}</div>
                    <div className="text-[11px] text-gray-500">{formatBytes(draft.file.size)}</div>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Click to select a PDF or image…</span>
                )}
              </div>
              {draft.file && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#6A9739' }} />}
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setDraft({ ...draft, file: e.target.files?.[0] ?? null })}
                className="hidden"
              />
            </label>
          </div>

          {/* Public/private toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={draft.isPublic}
              onChange={(e) => setDraft({ ...draft, isPublic: e.target.checked })}
              className="accent-[#EA2D34] w-4 h-4"
            />
            <span className="text-gray-700">
              <strong style={{ color: '#111111' }}>Visible to buyers</strong>
              <span className="text-gray-500 ml-1">— uncheck to keep this document admin-only</span>
            </span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={reset} className="btn-ghost text-sm">Cancel</button>
            <button
              type="submit"
              disabled={!draft.file}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#6A9739' }}
              onMouseEnter={(e) => !draft.file ? null : (e.currentTarget.style.backgroundColor = '#547a2d')}
              onMouseLeave={(e) => !draft.file ? null : (e.currentTarget.style.backgroundColor = '#6A9739')}
            >
              <Plus className="w-4 h-4" />
              Add Document
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
