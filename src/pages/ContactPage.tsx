import { useState } from 'react'
import { Phone, Mail, MapPin, MessageCircle, Send, Clock } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import SEO from '../components/common/SEO'
import { formatIndianPhone } from '../utils/phone'
import { isValidEmail, EMAIL_PATTERN } from '../utils/email'

function isIndianMobile(phone: string): boolean {
  const trimmed = phone.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('+')) return trimmed.startsWith('+91')
  const digits = trimmed.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) return true
  return digits.length === 10
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '+91 ', email: '', message: '', contact: 'phone' as 'phone' | 'whatsapp' })
  const [sent, setSent] = useState(false)

  const phoneIsIndian = isIndianMobile(form.phone)
  const emailRequired = !phoneIsIndian && form.phone.length > 0
  // Email shows an invalid-format warning whenever the user has typed
  // something that doesn't look like an email — silent while empty so we
  // don't yell before they've finished typing.
  const emailLooksInvalid = form.email.length > 0 && !isValidEmail(form.email)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (emailRequired && !form.email.trim()) {
      alert('Email is required for non-Indian phone numbers — we can only send SMS to Indian mobiles.')
      return
    }
    if (form.email.trim() && !isValidEmail(form.email)) {
      alert('Please enter a valid email address (e.g. you@example.com).')
      return
    }
    setSent(true)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <SEO
        path="/contact"
        title="Contact Us"
        description="Talk to the Jose For Land team. Call 99944 88490 (Mon-Sat 9 AM - 7 PM) or WhatsApp us. Free doorstep consultation, transparent dealings."
      />
      <PageHeader
        eyebrow="Get in touch"
        title="Contact Us"
        highlight="Contact"
        description="We're here to help. Reach out for any inquiry, site visit, or free consultation."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Get in Touch</h2>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: 'Primary', value: '+91 99944 88490', href: 'tel:+919994488490' },
                  { icon: Phone, label: 'Alternate', value: '+91 99448 85542', href: 'tel:+919944885542' },
                  { icon: MessageCircle, label: 'WhatsApp', value: '+91 99944 88490', href: 'https://wa.me/919994488490' },
                  { icon: Mail, label: 'Email', value: 'josepowerj@gmail.com', href: 'mailto:josepowerj@gmail.com' },
                ].map(({ icon: Icon, label, value, href }) => (
                  <a key={label} href={href} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                      style={{ backgroundColor: 'rgba(255,90,95,0.08)', color: '#FF5A5F' }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{label}</div>
                      <div className="text-gray-900 font-medium text-sm">{value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" style={{ color: '#6A9739' }} />
                <h3 className="font-semibold text-gray-900">Office Hours</h3>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex justify-between"><span>Monday – Saturday</span><span className="font-medium">9:00 AM – 7:00 PM</span></div>
                <div className="flex justify-between"><span>Sunday</span><span className="font-medium">By Appointment</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FF5A5F' }} />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Office Location</h3>
                  <p className="text-sm text-gray-600">Appattuvilai, Thuckalay,<br />Kanyakumari District,<br />Tamil Nadu – 629 175, India</p>
                </div>
              </div>
            </div>

            <div className="text-white rounded-xl p-5 text-center" style={{ backgroundColor: '#6A9739' }}>
              <p className="font-semibold mb-1">Free Doorstep Consultation</p>
              <p className="text-green-100 text-xs">Call now and we'll visit your property site — absolutely FREE!</p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              {sent ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'rgba(106,151,57,0.1)', color: '#6A9739' }}>
                    <Send className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 mb-6">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="btn-primary">
                    Send another
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-bold text-gray-900 text-xl mb-6">Send an Inquiry</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                        <input
                          required
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Your name"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                          <span>Phone Number *</span>
                          {form.phone && !phoneIsIndian && (
                            <span className="text-[11px] font-normal" style={{ color: '#B45309' }}>
                              ⚠ Email required
                            </span>
                          )}
                        </label>
                        <input
                          required
                          type="tel"
                          inputMode="tel"
                          pattern="\+91 \d{0,5}( \d{0,5})?"
                          maxLength={15}
                          value={form.phone}
                          // Auto-format to "+91 XXXXX XXXXX" and cap at 10 local digits.
                          onChange={(e) => setForm({ ...form, phone: formatIndianPhone(e.target.value) })}
                          placeholder="+91 XXXXX XXXXX"
                          className="input-field"
                          style={form.phone && !phoneIsIndian ? { borderColor: '#F59E0B' } : undefined}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                        <span>{emailRequired ? 'Email *' : 'Email (optional)'}</span>
                        {emailRequired && !form.email && (
                          <span className="text-[11px] font-normal" style={{ color: '#B45309' }}>
                            Required (non-Indian phone)
                          </span>
                        )}
                        {emailLooksInvalid && (
                          <span className="text-[11px] font-normal" style={{ color: '#B45309' }}>
                            ⚠ Looks incomplete
                          </span>
                        )}
                      </label>
                      <input
                        required={emailRequired}
                        type="email"
                        pattern={EMAIL_PATTERN}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="input-field"
                        style={(emailRequired && !form.email) || emailLooksInvalid
                          ? { borderColor: '#F59E0B' }
                          : undefined}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell us what you're looking for — location, area (in cents), budget..."
                        className="input-field resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
                      <div className="flex gap-3">
                        {(['phone', 'whatsapp'] as const).map((v) => (
                          <label
                            key={v}
                            className="flex items-center gap-2 flex-1 cursor-pointer border-2 rounded-xl p-3 transition-colors"
                            style={form.contact === v
                              ? { borderColor: '#FF5A5F', backgroundColor: 'rgba(255,90,95,0.04)' }
                              : { borderColor: '#e5e7eb' }}
                          >
                            <input
                              type="radio"
                              name="contact"
                              value={v}
                              checked={form.contact === v}
                              onChange={() => setForm({ ...form, contact: v })}
                              className="accent-[#FF5A5F]"
                            />
                            <span className="text-sm font-medium text-gray-700 capitalize">{v}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="w-full btn-primary py-3.5 text-base">
                      <Send className="w-4 h-4" /> Send Inquiry
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
