import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MessageSquare, Edit2, Eye, EyeOff, Save, X, Loader2, AlertCircle,
  CheckCircle2, Hash, Send, Smartphone,
} from 'lucide-react'
import {
  smsTemplatesApi,
  type SmsTemplate,
  type SmsTemplatePayload,
  type TestSmsResult,
} from '../../services/api'

interface FormState {
  label: string
  description: string
  body: string
  isActive: boolean
}

export default function AdminSmsTemplatesPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<SmsTemplate | null>(null)
  const [form, setForm] = useState<FormState>({ label: '', description: '', body: '', isActive: true })
  const [savedId, setSavedId] = useState<number | null>(null)
  const [testing, setTesting] = useState<SmsTemplate | null>(null)
  const [testPhone, setTestPhone] = useState('+91 ')
  const [testResult, setTestResult] = useState<TestSmsResult | null>(null)
  const [testError, setTestError] = useState<string | null>(null)

  const query = useQuery({
    queryKey: ['admin-sms-templates'],
    queryFn: () => smsTemplatesApi.getAll(),
  })

  const items = query.data ?? []
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-sms-templates'] })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SmsTemplatePayload }) =>
      smsTemplatesApi.update(id, payload),
    onSuccess: (updated) => {
      invalidate()
      setSavedId(updated.id)
      setTimeout(() => setSavedId(null), 2000)
      setEditing(null)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => smsTemplatesApi.toggle(id),
    onSuccess: () => invalidate(),
  })

  const testMutation = useMutation({
    mutationFn: ({ id, phone }: { id: number; phone: string }) =>
      smsTemplatesApi.sendTest(id, phone),
    onSuccess: (result) => {
      setTestResult(result)
      setTestError(null)
    },
    onError: (err: any) => {
      setTestError(err?.response?.data?.message ?? 'Failed to send test SMS')
      setTestResult(null)
    },
  })

  const openTest = (t: SmsTemplate) => {
    setTesting(t)
    setTestPhone('+91 ')
    setTestResult(null)
    setTestError(null)
  }

  const closeTest = () => {
    setTesting(null)
    setTestPhone('+91 ')
    setTestResult(null)
    setTestError(null)
  }

  const sendTest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!testing) return
    testMutation.mutate({ id: testing.id, phone: testPhone.trim() })
  }

  const openEdit = (t: SmsTemplate) => {
    setEditing(t)
    setForm({
      label: t.label,
      description: t.description ?? '',
      body: t.body,
      isActive: t.isActive,
    })
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    updateMutation.mutate({
      id: editing.id,
      payload: {
        label: form.label.trim(),
        description: form.description.trim() || null,
        body: form.body,
        availableVars: editing.availableVars,
        isActive: form.isActive,
      },
    })
  }

  const renderPreview = (body: string, vars: string | null) => {
    if (!vars) return body
    let result = body
    vars.split(',').forEach((v) => {
      const sample: Record<string, string> = {
        name: 'Rajan Kumar', phone: '+91 98765 43210', title: '15 Cents Land - Nagercoil',
        id: '101', actor: 'Sundaram Pillai', prevStatus: 'Assigned', newStatus: 'InProgress',
        priceLakhs: '22.50', area: '15', propertyContext: ' re property #1', propertyId: '1',
        noteSuffix: ' · note: Site visit scheduled for Sat',
        reasonSuffix: ' Reason: Insufficient documents.',
      }
      const key = v.trim()
      result = result.split(`{${key}}`).join(sample[key] ?? `{${key}}`)
    })
    return result
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: '#6A9739' }} />
            SMS Templates
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Edit the message body that gets sent for each notification. Use <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{'{name}'}</code> placeholders for dynamic data.
            {query.isFetching && <span className="ml-2 inline-flex items-center gap-1" style={{ color: '#6A9739' }}>
              <Loader2 className="w-3 h-3 animate-spin" /> updating
            </span>}
          </p>
        </div>
      </div>

      {query.isLoading ? (
        <div className="py-16 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading templates…</p>
        </div>
      ) : query.isError ? (
        <div className="py-16 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-600">Failed to load templates.</p>
          <button onClick={() => query.refetch()}
            className="mt-3 text-xs font-semibold underline" style={{ color: '#EA2D34' }}>
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id}
              className="bg-white rounded-xl border shadow-sm overflow-hidden transition-shadow"
              style={{ borderColor: savedId === t.id ? '#6A9739' : '#E5E7EB' }}>

              <div className="p-5 flex items-start gap-4">
                {/* Status indicator */}
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={t.isActive
                    ? { backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }
                    : { backgroundColor: 'rgba(245,158,11,0.10)', color: '#B45309' }}>
                  <MessageSquare className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{t.label}</h3>
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                      <Hash className="w-2.5 h-2.5 inline -mt-0.5" /> {t.key}
                    </span>
                    {!t.isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#B45309' }}>
                        Disabled
                      </span>
                    )}
                    {savedId === t.id && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded inline-flex items-center gap-1"
                        style={{ backgroundColor: 'rgba(106,151,57,0.12)', color: '#6A9739' }}>
                        <CheckCircle2 className="w-3 h-3" /> Saved
                      </span>
                    )}
                  </div>

                  {t.description && (
                    <p className="text-xs text-gray-500 mb-2.5">{t.description}</p>
                  )}

                  <div className="rounded-lg p-3 text-sm leading-relaxed border-l-3"
                    style={{ backgroundColor: '#FAFAF8', borderLeftColor: '#EA2D34', borderLeftWidth: '3px' }}>
                    {t.body}
                  </div>

                  {t.availableVars && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Variables:</span>
                      {t.availableVars.split(',').map((v) => (
                        <code key={v} className="text-[11px] px-1.5 py-0.5 rounded font-mono"
                          style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
                          {`{${v.trim()}}`}
                        </code>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleMutation.mutate(t.id)}
                    title={t.isActive ? 'Disable' : 'Enable'}
                    disabled={toggleMutation.isPending}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                    {t.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openTest(t)}
                    title="Send test SMS"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors"
                    style={{ backgroundColor: 'rgba(255,90,95,0.08)', color: '#EA2D34' }}>
                    <Send className="w-3.5 h-3.5" /> Test
                  </button>
                  <button onClick={() => openEdit(t)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors"
                    style={{ backgroundColor: 'rgba(106,151,57,0.08)', color: '#6A9739' }}>
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === Send Test SMS modal === */}
      {testing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={closeTest}>
          <form onSubmit={sendTest}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Smartphone className="w-5 h-5" style={{ color: '#EA2D34' }} />
                  Send Test SMS
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Template: <span className="font-mono">{testing.key}</span>
                </p>
              </div>
              <button type="button" onClick={closeTest} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!testResult && !testError && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Recipient Phone *
                    </label>
                    <input
                      required
                      type="tel"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="+91 99944 88490"
                      className="input-field"
                      autoFocus
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      Indian mobile only (+91 / 10-digit). Will use sample variables for placeholder fields.
                    </p>
                  </div>

                  <div className="rounded-lg p-3 text-sm leading-relaxed border-l-4"
                    style={{ backgroundColor: '#F8F6F3', borderLeftColor: '#EA2D34' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Sample preview
                    </div>
                    {renderPreview(testing.body, testing.availableVars)}
                  </div>
                </>
              )}

              {testError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{testError}</span>
                </div>
              )}

              {testResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-semibold">SMS dispatched</span>
                  </div>

                  <dl className="text-sm space-y-2">
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500 shrink-0">Provider</dt>
                      <dd className="font-mono text-gray-900 text-right">{testResult.provider}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500 shrink-0">Sent to</dt>
                      <dd className="font-mono text-gray-900 text-right">{testResult.phone}</dd>
                    </div>
                  </dl>

                  <div className="rounded-lg p-3 border-l-4"
                    style={{ backgroundColor: '#F8F6F3', borderLeftColor: '#6A9739' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Message body sent
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#111111' }}>
                      {testResult.renderedBody}
                    </p>
                  </div>

                  {testResult.note && (
                    <p className="text-xs text-gray-500 leading-relaxed flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#B45309' }} />
                      <span>{testResult.note}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
              {testResult || testError ? (
                <button type="button" onClick={closeTest} className="btn-ghost text-sm">
                  Close
                </button>
              ) : (
                <>
                  <button type="button" onClick={closeTest}
                    disabled={testMutation.isPending}
                    className="btn-ghost text-sm">
                    Cancel
                  </button>
                  <button type="submit"
                    disabled={testMutation.isPending || !testPhone.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                    style={{ backgroundColor: '#EA2D34' }}
                    onMouseEnter={e => !testMutation.isPending && (e.currentTarget.style.backgroundColor = '#e04a4f')}
                    onMouseLeave={e => !testMutation.isPending && (e.currentTarget.style.backgroundColor = '#EA2D34')}>
                    {testMutation.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                      : <><Send className="w-4 h-4" /> Send Test SMS</>
                    }
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      )}

      {/* === Edit modal === */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditing(null)}>
          <form onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full shadow-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{editing.label}</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  <Hash className="w-3 h-3 inline -mt-0.5" /> {editing.key}
                </p>
              </div>
              <button type="button" onClick={() => setEditing(null)}
                className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Label *</label>
                <input required value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <input value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field"
                  placeholder="When does this template fire?" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Message Body *</span>
                  <span className="text-[11px] font-normal text-gray-400">
                    {form.body.length} chars · ~{Math.ceil(form.body.length / 160)} SMS
                  </span>
                </label>
                <textarea required rows={4}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="input-field resize-none font-mono text-sm" />
              </div>

              {editing.availableVars && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Available variables (click to insert)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {editing.availableVars.split(',').map((v) => {
                      const variable = `{${v.trim()}}`
                      return (
                        <button key={v} type="button"
                          onClick={() => setForm(f => ({ ...f, body: f.body + variable }))}
                          className="text-[11px] px-2 py-1 rounded font-mono transition-colors"
                          style={{ backgroundColor: 'rgba(106,151,57,0.08)', color: '#6A9739' }}>
                          {variable}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Live preview */}
              <div className="rounded-xl border p-4" style={{ backgroundColor: '#F8F6F3', borderColor: '#EAEAE5' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">📱 Sample preview</p>
                <p className="text-sm leading-relaxed" style={{ color: '#111111' }}>
                  {renderPreview(form.body, editing.availableVars)}
                </p>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <div onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className="w-11 h-6 rounded-full transition-colors relative shrink-0"
                  style={{ backgroundColor: form.isActive ? '#6A9739' : '#E5E7EB' }}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: form.isActive ? 'translateX(22px)' : 'translateX(2px)' }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {form.isActive ? 'Active' : 'Disabled'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {form.isActive
                      ? 'This SMS will be sent when its trigger event happens.'
                      : 'No SMS will be sent for this trigger until you re-enable it.'}
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
              <button type="button" onClick={() => setEditing(null)}
                disabled={updateMutation.isPending}
                className="btn-ghost text-sm">
                Cancel
              </button>
              <button type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#6A9739' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#547a2d')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6A9739')}>
                {updateMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><Save className="w-4 h-4" /> Save Template</>
                }
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
