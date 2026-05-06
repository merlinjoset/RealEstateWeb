import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  FileText, FileImage, ShieldCheck, Lock, Send, X, Phone, Mail, User,
  CheckCircle2, Loader2, AlertCircle, MessageSquare,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { contactApi } from '../../services/api'
import {
  DOC_TYPE_LABELS,
} from './PropertyDocuments'
import type { PropertyDocument } from '../../types'

const DOC_TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  ec:          { bg: 'rgba(255,90,95,0.10)',  color: '#FF5A5F' },
  patta:       { bg: 'rgba(106,151,57,0.10)', color: '#6A9739' },
  chitta:      { bg: 'rgba(106,151,57,0.10)', color: '#6A9739' },
  layout:      { bg: 'rgba(41,50,55,0.08)',   color: '#293237' },
  sale_deed:   { bg: 'rgba(255,90,95,0.10)',  color: '#FF5A5F' },
  tax_receipt: { bg: 'rgba(245,158,11,0.10)', color: '#B45309' },
  noc:         { bg: 'rgba(106,151,57,0.10)', color: '#6A9739' },
  fmb:         { bg: 'rgba(41,50,55,0.08)',   color: '#293237' },
  other:       { bg: 'rgba(107,114,128,0.10)', color: '#6B7280' },
}

interface Props {
  documents: PropertyDocument[]
  propertyId: number
  propertyTitle: string
}

/**
 * Buyer-facing summary that lists which document types are available without
 * exposing the actual files. Clicking "Request to View" captures an inquiry
 * via /api/inquiries, which fires the standard confirmation SMS to the user
 * and the admin-notification SMS to staff.
 */
export default function PropertyDocumentsPublic({ documents, propertyId, propertyTitle }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  const visible = documents.filter(d => d.isPublic)

  if (visible.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No documents have been published for this property yet.</p>
        <p className="text-xs text-gray-400 mt-1">Contact us — we'll share verified copies on request.</p>
      </div>
    )
  }

  // Deduplicate by document type — show one chip per category
  const types = Array.from(new Set(visible.map(d => d.type)))

  return (
    <>
      <div className="rounded-xl p-5 border" style={{
        backgroundColor: 'rgba(106,151,57,0.04)', borderColor: 'rgba(106,151,57,0.2)',
      }}>
        {/* Trust header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#6A9739', color: 'white' }}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              {visible.length} verified document{visible.length === 1 ? '' : 's'} available
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              Personally verified by our team. Submit a quick request and we'll share copies after a brief identity check.
            </p>
          </div>
        </div>

        {/* Type chips (no filenames, no sizes — just categories) */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {types.map((t) => {
            const badge = DOC_TYPE_BADGE[t] ?? DOC_TYPE_BADGE.other
            const Icon = t === 'layout' || t === 'fmb' ? FileImage : FileText
            return (
              <span key={t} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: badge.bg, color: badge.color }}>
                <Icon className="w-3 h-3" />
                {DOC_TYPE_LABELS[t]}
              </span>
            )
          })}
        </div>

        {/* CTA */}
        <button onClick={() => setModalOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-colors"
          style={{ backgroundColor: '#FF5A5F' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FF5A5F')}>
          <Lock className="w-4 h-4" />
          Request to View Documents
        </button>

        <p className="text-[11px] text-gray-500 text-center mt-2 leading-relaxed">
          Why request? We protect sensitive title documents from copy-paste fraud.
          You'll get them within 2–5 hours, often the same hour.
        </p>
      </div>

      {modalOpen && (
        <DocumentRequestModal
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

/* ============================ Inquiry modal ============================ */

interface ModalProps {
  propertyId: number
  propertyTitle: string
  onClose: () => void
}

interface FormState {
  name: string
  phone: string
  email: string
  message: string
  preferredContact: 'phone' | 'whatsapp'
}

function isIndianMobile(phone: string): boolean {
  const trimmed = phone.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('+')) return trimmed.startsWith('+91')
  const digits = trimmed.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) return true
  return digits.length === 10
}

function DocumentRequestModal({ propertyId, propertyTitle, onClose }: ModalProps) {
  const { user } = useAuth()
  const [form, setForm] = useState<FormState>({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    message: `I'd like to view the documents (EC, Patta, Chitta etc.) for "${propertyTitle}". Please share verified copies at your earliest convenience.`,
    preferredContact: 'phone',
  })
  const [submitted, setSubmitted] = useState(false)

  const phoneIsIndian = isIndianMobile(form.phone)
  const emailRequired = !phoneIsIndian && form.phone.length > 0

  const submitMutation = useMutation({
    mutationFn: () => contactApi.send({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      message: form.message.trim(),
      propertyId,
      preferredContact: form.preferredContact,
      type: 'DocumentRequest',  // ← tagged in backend so admins can filter
    }),
    onSuccess: () => setSubmitted(true),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (emailRequired && !form.email.trim()) {
      alert('Email is required for non-Indian phone numbers.')
      return
    }
    submitMutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl my-8 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Lock className="w-5 h-5" style={{ color: '#FF5A5F' }} />
              Request Documents
            </h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              For: <strong>{propertyTitle}</strong>
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold mb-2 tracking-tight" style={{ color: '#111111' }}>
              Request received!
            </h4>
            <p className="text-sm leading-relaxed mb-1" style={{ color: '#4B5563' }}>
              Thank you, <strong>{form.name}</strong>.
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#4B5563' }}>
              Our team will call you on <strong>{form.phone}</strong> within 2–5 hours
              with the verified documents.
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-6">
              <Phone className="w-3.5 h-3.5" style={{ color: '#FF5A5F' }} />
              SMS confirmation sent to your phone
            </div>

            <button onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#FF5A5F' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FF5A5F')}>
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {submitMutation.isError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Could not submit your request. Please try again or call +91 99944 88490.</span>
              </div>
            )}

            <Field icon={User} label="Full Name *">
              <input required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name" className="input-field" />
            </Field>

            <Field icon={Phone} label="Phone *"
              hint={form.phone && !phoneIsIndian
                ? '⚠ Non-Indian — email required' : 'We will send a confirmation SMS'}>
              <input required type="tel" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className="input-field"
                style={form.phone && !phoneIsIndian ? { borderColor: '#F59E0B' } : undefined} />
            </Field>

            <Field icon={Mail} label={emailRequired ? 'Email *' : 'Email (optional)'}>
              <input required={emailRequired} type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input-field"
                style={emailRequired && !form.email ? { borderColor: '#F59E0B' } : undefined} />
            </Field>

            <Field icon={MessageSquare} label="Message">
              <textarea rows={3} value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input-field resize-none text-sm" />
            </Field>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Preferred contact
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['phone', 'whatsapp'] as const).map((v) => {
                  const isActive = form.preferredContact === v
                  return (
                    <button key={v} type="button"
                      onClick={() => setForm({ ...form, preferredContact: v })}
                      className="px-3 py-2 rounded-lg text-xs font-semibold border-2 transition-colors capitalize"
                      style={isActive
                        ? { backgroundColor: '#6A9739', borderColor: '#6A9739', color: 'white' }
                        : { backgroundColor: 'white', borderColor: '#E5E7EB', color: '#4B5563' }}>
                      {v}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-lg p-3 text-xs flex items-start gap-2 leading-relaxed"
              style={{ backgroundColor: '#FAFAF8', color: '#374151' }}>
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#6A9739' }} />
              <span>
                Your details stay private. We use them only to deliver the documents and never share
                with third parties.
              </span>
            </div>

            <button type="submit"
              disabled={submitMutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#FF5A5F' }}
              onMouseEnter={e => !submitMutation.isPending && (e.currentTarget.style.backgroundColor = '#e04a4f')}
              onMouseLeave={e => !submitMutation.isPending && (e.currentTarget.style.backgroundColor = '#FF5A5F')}>
              {submitMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending request…</>
                : <><Send className="w-4 h-4" /> Send Request</>
              }
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

/* ─────────────────── Helpers ─────────────────── */

function Field({ icon: Icon, label, hint, children }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-gray-400" />
          {label}
        </span>
        {hint && <span className="text-[11px] font-normal text-gray-400">{hint}</span>}
      </label>
      {children}
    </div>
  )
}
