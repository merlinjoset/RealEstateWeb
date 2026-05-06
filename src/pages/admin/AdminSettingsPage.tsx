import { useState } from 'react'
import {
  Settings as SettingsIcon, Building2, Phone, Mail, MapPin, Globe, Image as ImageIcon,
  Bell, Lock, Shield, Save, Check, Eye, EyeOff, Upload, Share2, Video, Camera,
  MessageCircle, Clock, Trash2, IndianRupee, AlertCircle,
} from 'lucide-react'

type TabKey = 'company' | 'contact' | 'social' | 'notifications' | 'security' | 'appearance' | 'danger'

const TABS: Array<{ key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; group: string }> = [
  { key: 'company',       label: 'Company',        icon: Building2,    group: 'general' },
  { key: 'contact',       label: 'Contact Details', icon: Phone,       group: 'general' },
  { key: 'social',        label: 'Social Links',   icon: Globe,        group: 'general' },
  { key: 'appearance',    label: 'Appearance',     icon: ImageIcon,    group: 'general' },
  { key: 'notifications', label: 'Notifications',  icon: Bell,         group: 'account' },
  { key: 'security',      label: 'Security',       icon: Lock,         group: 'account' },
  { key: 'danger',        label: 'Danger Zone',    icon: AlertCircle,  group: 'account' },
]

interface SettingsState {
  // Company
  companyName: string
  tagline: string
  about: string
  yearEstablished: string
  registrationNumber: string

  // Contact
  primaryPhone: string
  altPhone: string
  whatsapp: string
  email: string
  addressLine: string
  city: string
  pinCode: string
  officeHours: string

  // Social
  facebook: string
  instagram: string
  youtube: string
  website: string

  // Appearance
  primaryColor: string
  secondaryColor: string
  showStatsStrip: boolean
  showFreeBadge: boolean

  // Notifications
  notifyNewInquiry: boolean
  notifyDailyDigest: boolean
  notifyNewProperty: boolean
  notifyEmail: boolean
  notifySms: boolean

  // Security
  twoFactorEnabled: boolean
  sessionTimeoutMins: number
  requireStrongPasswords: boolean
}

const INITIAL: SettingsState = {
  companyName: 'Jose For Land',
  tagline: 'Live where you want',
  about: "Kanyakumari's most trusted land property consultancy with over a decade of local experience.",
  yearEstablished: '2014',
  registrationNumber: 'TN/REA/2014/00428',

  primaryPhone: '+91 99944 88490',
  altPhone: '+91 96987 12904',
  whatsapp: '+91 99944 88490',
  email: 'josepowerj@gmail.com',
  addressLine: 'Appattuvilai, Thuckalay',
  city: 'Kanyakumari District, Tamil Nadu, India',
  pinCode: '629175',
  officeHours: 'Mon–Sat, 9:00 AM – 7:00 PM',

  facebook: 'https://facebook.com/joseforland',
  instagram: 'https://instagram.com/joseforland',
  youtube: 'https://youtube.com/@joseforland',
  website: 'https://joseforland.com',

  primaryColor: '#FF5A5F',
  secondaryColor: '#6A9739',
  showStatsStrip: true,
  showFreeBadge: true,

  notifyNewInquiry: true,
  notifyDailyDigest: true,
  notifyNewProperty: true,
  notifyEmail: true,
  notifySms: false,

  twoFactorEnabled: false,
  sessionTimeoutMins: 60,
  requireStrongPasswords: true,
}

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<TabKey>('company')
  const [settings, setSettings] = useState<SettingsState>(INITIAL)
  const [savedFlash, setSavedFlash] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  const set = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) =>
    setSettings(prev => ({ ...prev, [key]: value }))

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2200)
  }

  const reset = () => {
    setSettings(INITIAL)
    setShowResetModal(false)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2200)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" style={{ color: '#6A9739' }} />
            Settings
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your platform configuration</p>
        </div>
        {savedFlash && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold animate-in fade-in slide-in-from-top-1"
            style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
            <Check className="w-3.5 h-3.5" /> Settings saved
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Tab nav */}
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sticky top-6">
            {['general', 'account'].map((group) => (
              <div key={group} className={group === 'account' ? 'mt-2 pt-2 border-t border-gray-100' : ''}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
                  {group === 'general' ? 'General' : 'Account'}
                </p>
                {TABS.filter(t => t.group === group).map((t) => {
                  const Icon = t.icon
                  const isActive = tab === t.key
                  const isDanger = t.key === 'danger'
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      style={isActive
                        ? isDanger
                          ? { backgroundColor: '#FEE2E2', color: '#B91C1C' }
                          : { backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }
                        : { color: isDanger ? '#B91C1C' : '#374151' }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = '#F8F6F3'
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{t.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Content panel */}
        <div className="lg:col-span-9">
          <form onSubmit={handleSave}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Company */}
            {tab === 'company' && (
              <Section title="Company Information" desc="The public-facing details about Jose For Land">
                <Field label="Company Name" required>
                  <input className="input-field" value={settings.companyName}
                    onChange={(e) => set('companyName', e.target.value)} />
                </Field>
                <Field label="Tagline">
                  <input className="input-field" value={settings.tagline}
                    onChange={(e) => set('tagline', e.target.value)}
                    placeholder="A short brand tagline" />
                </Field>
                <Field label="About">
                  <textarea className="input-field resize-none" rows={3} value={settings.about}
                    onChange={(e) => set('about', e.target.value)} />
                </Field>
                <Row>
                  <Field label="Year Established">
                    <input className="input-field" value={settings.yearEstablished}
                      onChange={(e) => set('yearEstablished', e.target.value)} />
                  </Field>
                  <Field label="Registration Number">
                    <input className="input-field" value={settings.registrationNumber}
                      onChange={(e) => set('registrationNumber', e.target.value)} />
                  </Field>
                </Row>
                <Field label="Logo">
                  <UploadBox label="Click to replace logo (PNG with transparent background recommended)" />
                </Field>
              </Section>
            )}

            {/* Contact */}
            {tab === 'contact' && (
              <Section title="Contact Details" desc="Phone, email, and office address shown on the website">
                <Row>
                  <Field label="Primary Phone" icon={Phone}>
                    <input className="input-field" value={settings.primaryPhone}
                      onChange={(e) => set('primaryPhone', e.target.value)} />
                  </Field>
                  <Field label="Alternate Phone" icon={Phone}>
                    <input className="input-field" value={settings.altPhone}
                      onChange={(e) => set('altPhone', e.target.value)} />
                  </Field>
                </Row>
                <Row>
                  <Field label="WhatsApp Number" icon={MessageCircle}>
                    <input className="input-field" value={settings.whatsapp}
                      onChange={(e) => set('whatsapp', e.target.value)} />
                  </Field>
                  <Field label="Email" icon={Mail}>
                    <input className="input-field" type="email" value={settings.email}
                      onChange={(e) => set('email', e.target.value)} />
                  </Field>
                </Row>
                <Field label="Address Line" icon={MapPin}>
                  <input className="input-field" value={settings.addressLine}
                    onChange={(e) => set('addressLine', e.target.value)} />
                </Field>
                <Row>
                  <Field label="City / Region">
                    <input className="input-field" value={settings.city}
                      onChange={(e) => set('city', e.target.value)} />
                  </Field>
                  <Field label="PIN Code">
                    <input className="input-field" value={settings.pinCode}
                      onChange={(e) => set('pinCode', e.target.value)} />
                  </Field>
                </Row>
                <Field label="Office Hours" icon={Clock}>
                  <input className="input-field" value={settings.officeHours}
                    onChange={(e) => set('officeHours', e.target.value)} />
                </Field>
              </Section>
            )}

            {/* Social */}
            {tab === 'social' && (
              <Section title="Social Links" desc="Profile URLs that appear in the website footer">
                <Field label="Facebook" icon={Share2}>
                  <input className="input-field" value={settings.facebook}
                    onChange={(e) => set('facebook', e.target.value)} placeholder="https://facebook.com/…" />
                </Field>
                <Field label="Instagram" icon={Camera}>
                  <input className="input-field" value={settings.instagram}
                    onChange={(e) => set('instagram', e.target.value)} placeholder="https://instagram.com/…" />
                </Field>
                <Field label="YouTube" icon={Video}>
                  <input className="input-field" value={settings.youtube}
                    onChange={(e) => set('youtube', e.target.value)} placeholder="https://youtube.com/@…" />
                </Field>
                <Field label="Website / Other">
                  <input className="input-field" value={settings.website}
                    onChange={(e) => set('website', e.target.value)} placeholder="https://…" />
                </Field>
              </Section>
            )}

            {/* Appearance */}
            {tab === 'appearance' && (
              <Section title="Appearance" desc="Brand colors and homepage display options">
                <Row>
                  <Field label="Primary Color (CTAs, prices)">
                    <ColorInput value={settings.primaryColor}
                      onChange={(v) => set('primaryColor', v)} />
                  </Field>
                  <Field label="Secondary Color (Buttons, badges)">
                    <ColorInput value={settings.secondaryColor}
                      onChange={(v) => set('secondaryColor', v)} />
                  </Field>
                </Row>
                <ToggleRow
                  label="Show stats strip on home"
                  desc="The 4-column stats bar (434+, 200+, 100%, 10+) below the hero"
                  checked={settings.showStatsStrip}
                  onChange={(v) => set('showStatsStrip', v)} />
                <ToggleRow
                  label="Show 'FREE consultation' badge"
                  desc="Displayed in the hero section under the headline"
                  checked={settings.showFreeBadge}
                  onChange={(v) => set('showFreeBadge', v)} />
              </Section>
            )}

            {/* Notifications */}
            {tab === 'notifications' && (
              <Section title="Notifications" desc="Choose what triggers an alert and how you receive it">
                <ToggleRow
                  label="New inquiry received"
                  desc="Alert when a buyer submits a contact form or inquiry"
                  checked={settings.notifyNewInquiry}
                  onChange={(v) => set('notifyNewInquiry', v)} />
                <ToggleRow
                  label="New property submission"
                  desc="When a seller submits a property for approval"
                  checked={settings.notifyNewProperty}
                  onChange={(v) => set('notifyNewProperty', v)} />
                <ToggleRow
                  label="Daily activity digest"
                  desc="Summary of inquiries and listings every morning"
                  checked={settings.notifyDailyDigest}
                  onChange={(v) => set('notifyDailyDigest', v)} />

                <hr className="my-4 border-gray-100" />
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Channels</p>
                <ToggleRow
                  label="Email notifications"
                  desc={`Send to ${settings.email}`}
                  checked={settings.notifyEmail}
                  onChange={(v) => set('notifyEmail', v)} />
                <ToggleRow
                  label="SMS notifications"
                  desc={`Send to ${settings.primaryPhone} (charges may apply)`}
                  checked={settings.notifySms}
                  onChange={(v) => set('notifySms', v)} />
              </Section>
            )}

            {/* Security */}
            {tab === 'security' && (
              <Section title="Security" desc="Account protection and access controls">
                <PasswordChange />

                <hr className="my-4 border-gray-100" />

                <ToggleRow
                  label="Two-factor authentication"
                  desc="Require a code from your phone in addition to password"
                  checked={settings.twoFactorEnabled}
                  onChange={(v) => set('twoFactorEnabled', v)} />
                <ToggleRow
                  label="Require strong passwords for users"
                  desc="Min 8 chars, mix of letters, numbers, and symbols"
                  checked={settings.requireStrongPasswords}
                  onChange={(v) => set('requireStrongPasswords', v)} />
                <Field label="Session timeout (minutes)" icon={Shield}>
                  <input className="input-field" type="number" min={5} max={480}
                    value={settings.sessionTimeoutMins}
                    onChange={(e) => set('sessionTimeoutMins', Number(e.target.value))} />
                </Field>
              </Section>
            )}

            {/* Danger zone */}
            {tab === 'danger' && (
              <Section title="Danger Zone" desc="Irreversible operations — proceed with caution">
                <div className="rounded-xl border-2 border-red-200 p-4 bg-red-50/50">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-900 text-sm">Reset all settings</h4>
                      <p className="text-xs text-red-700 mt-0.5">
                        Restore every setting on this page back to its default value. Existing properties,
                        inquiries, and users are not affected.
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowResetModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
                    <Trash2 className="w-4 h-4" />
                    Reset to defaults
                  </button>
                </div>
              </Section>
            )}

            {/* Save bar */}
            {tab !== 'danger' && (
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Changes are applied site-wide once saved.
                </p>
                <button type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors"
                  style={{ backgroundColor: '#6A9739' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#547a2d')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6A9739')}>
                  <Save className="w-4 h-4" /> Save changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Reset confirm */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Reset all settings?</h3>
            <p className="text-gray-500 text-sm mb-5">
              This restores every setting to its default value. You cannot undo this action.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetModal(false)} className="flex-1 btn-ghost border border-gray-200">
                Cancel
              </button>
              <button onClick={reset}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
                <Trash2 className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================== Helpers ================== */

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="p-6">
      <div className="mb-5 pb-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">{title}</h3>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}

function Field({ label, required, icon: Icon, children }: {
  label: string
  required?: boolean
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        {label}
        {required && <span style={{ color: '#FF5A5F' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function ToggleRow({ label, desc, checked, onChange }: {
  label: string
  desc?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
      <button type="button"
        onClick={() => onChange(!checked)}
        className="w-11 h-6 rounded-full transition-colors relative shrink-0"
        style={{ backgroundColor: checked ? '#6A9739' : '#E5E7EB' }}>
        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}
      </div>
    </label>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
      </div>
      <input className="input-field flex-1 font-mono text-sm uppercase" value={value}
        onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function UploadBox({ label }: { label: string }) {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#6A9739] transition-colors cursor-pointer">
      <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function PasswordChange() {
  const [show, setShow] = useState(false)
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })

  return (
    <div className="rounded-xl p-4 border border-gray-100" style={{ backgroundColor: '#FAFAF8' }}>
      <p className="text-sm font-bold text-gray-900 mb-3">Change Password</p>
      <div className="space-y-3">
        <div className="relative">
          <input type={show ? 'text' : 'password'} className="input-field pr-10"
            placeholder="Current password" value={pwd.current}
            onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type={show ? 'text' : 'password'} className="input-field"
            placeholder="New password" value={pwd.next}
            onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
          <input type={show ? 'text' : 'password'} className="input-field"
            placeholder="Confirm new password" value={pwd.confirm}
            onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
        </div>
        <button type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
          style={{ backgroundColor: '#FF5A5F' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e04a4f')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF5A5F')}>
          <IndianRupee className="w-3.5 h-3.5" /> Update password
        </button>
      </div>
    </div>
  )
}
