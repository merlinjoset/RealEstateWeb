import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react'
import { contactApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { isValidEmail, EMAIL_PATTERN } from '../../utils/email'
import { isValidIndianMobile, PHONE_PATTERN } from '../../utils/phone'

interface Props {
  propertyId: number
  propertyTitle: string
}

/**
 * Inline "Send an Inquiry" card shown in the property detail sidebar. Posts a
 * General inquiry to /api/inquiries tagged with this property's id, so the
 * admin inbox shows exactly which listing the lead is about. Pre-fills the
 * signed-in user's details and a property-aware default message.
 */
export default function PropertyInquiryForm({ propertyId, propertyTitle }: Props) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    message: `I'm interested in "${propertyTitle}". Please share more details and arrange a site visit.`,
    contact: 'phone' as 'phone' | 'whatsapp',
  })

  const emailLooksInvalid = form.email.length > 0 && !isValidEmail(form.email)
  const phoneLooksInvalid = form.phone.length > 0 && !isValidIndianMobile(form.phone)

  const submitMutation = useMutation({
    mutationFn: () => contactApi.send({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      message: form.message.trim(),
      propertyId,
      preferredContact: form.contact,
      type: 'General',
    }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidIndianMobile(form.phone)) {
      alert('Please enter a valid 10-digit mobile number (starting with 6, 7, 8, or 9).')
      return
    }
    if (form.email.trim() && !isValidEmail(form.email)) {
      alert('Please enter a valid email address (e.g. you@example.com).')
      return
    }
    submitMutation.mutate()
  }

  if (submitMutation.isSuccess) {
    return (
      <div className="rounded-xl border border-gray-100 p-6 text-center" style={{ backgroundColor: 'rgba(106,151,57,0.06)' }}>
        <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: 'rgba(106,151,57,0.12)', color: '#6A9739' }}>
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h4 className="text-lg font-bold mb-1" style={{ color: '#111111' }}>Inquiry sent!</h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          Thank you, <strong>{form.name}</strong>. Our team will contact you on{' '}
          <strong>{form.phone}</strong> shortly about this property.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4" style={{ color: '#EA2D34' }} />
        Send an Inquiry
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        {submitMutation.isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Could not send your inquiry. Please try again or call +91 99944 88490.</span>
          </div>
        )}

        <input
          required
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your name *"
          className="input-field"
        />

        <div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">+91</span>
            <input
              required
              type="tel"
              inputMode="numeric"
              maxLength={10}
              pattern={PHONE_PATTERN}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
              placeholder="10-digit mobile *"
              className="input-field pl-12"
              style={phoneLooksInvalid ? { borderColor: '#F59E0B' } : undefined}
            />
          </div>
          {phoneLooksInvalid && (
            <p className="text-[11px] mt-1" style={{ color: '#B45309' }}>
              Enter a valid 10-digit mobile (starts with 6–9).
            </p>
          )}
        </div>

        <input
          type="email"
          pattern={EMAIL_PATTERN}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email (optional)"
          className="input-field"
          style={emailLooksInvalid ? { borderColor: '#F59E0B' } : undefined}
        />

        <textarea
          required
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Your message *"
          className="input-field resize-none"
        />

        <div className="flex gap-2">
          {(['phone', 'whatsapp'] as const).map((v) => (
            <label
              key={v}
              className="flex items-center justify-center gap-2 flex-1 cursor-pointer border-2 rounded-lg py-2 text-sm font-medium capitalize transition-colors"
              style={form.contact === v
                ? { borderColor: '#EA2D34', backgroundColor: 'rgba(234,45,52,0.05)', color: '#EA2D34' }
                : { borderColor: '#e5e7eb', color: '#374151' }}
            >
              <input
                type="radio"
                name="inquiry-contact"
                value={v}
                checked={form.contact === v}
                onChange={() => setForm({ ...form, contact: v })}
                className="accent-[#EA2D34]"
              />
              {v}
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="w-full btn-primary py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" /> {submitMutation.isPending ? 'Sending…' : 'Send Inquiry'}
        </button>
      </form>
    </div>
  )
}
