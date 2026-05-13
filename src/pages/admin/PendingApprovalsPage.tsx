import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Check, X, MapPin, Ruler, User, Calendar, Phone, Video, AlertCircle,
  Loader2, Inbox, UserPlus, UserCheck, Sparkles,
} from 'lucide-react'
import { propertiesApi, usersApi, type AdminUser } from '../../services/api'
import { VIDEO_PROMOTION_FEE_RATE, type Property } from '../../types'

function formatLakhs(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

const TYPE_LABELS: Record<string, string> = {
  open_land: 'Open Land',
  OpenLand: 'Open Land',
  land_with_building: 'Land + Building',
  LandWithBuilding: 'Land + Building',
  agricultural: 'Agricultural',
  Agricultural: 'Agricultural',
  commercial: 'Commercial',
  Commercial: 'Commercial',
  residential_plot: 'Residential Plot',
  ResidentialPlot: 'Residential Plot',
}

export default function PendingApprovalsPage() {
  const { id: routeId } = useParams<{ id?: string }>()
  const queryClient = useQueryClient()

  const [selected, setSelected] = useState<Property | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null)
  const [videoOnly, setVideoOnly] = useState(false)

  // ── Data ─────────────────────────────────────────────────────────────
  const pendingQuery = useQuery({
    queryKey: ['admin-pending-properties'],
    queryFn: propertiesApi.getPending,
    refetchInterval: 60_000,
  })

  const usersQuery = useQuery({
    queryKey: ['admin-users', 'assignees'],
    queryFn: () => usersApi.getAll(),
  })

  const items = pendingQuery.data ?? []
  // Assignment is restricted to Employees only — keeps the verification
  // workflow inside the team and out of the Agents' / Admins' inboxes.
  const assignees = useMemo(
    () => (usersQuery.data?.items ?? [])
      .filter((u: AdminUser) => u.role === 'Employee' && u.isActive),
    [usersQuery.data],
  )

  // Pre-select item when navigated with /admin/pending/:id
  useEffect(() => {
    if (routeId && items.length) {
      const numId = Number(routeId)
      const match = items.find((p) => p.id === numId)
      if (match) setSelected(match)
    }
  }, [routeId, items])

  // Keep the detail panel in sync with refreshed list data
  useEffect(() => {
    if (selected) {
      const fresh = items.find((p) => p.id === selected.id)
      if (fresh && fresh !== selected) setSelected(fresh)
    }
  }, [items, selected])

  // ── Mutations ────────────────────────────────────────────────────────
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-pending-properties'] })

  const approveMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: 'approve' | 'reject'; reason?: string }) =>
      propertiesApi.approve(id, action, reason),
    onSuccess: () => {
      invalidate()
      setSelected(null)
      setShowRejectModal(null)
      setRejectReason('')
    },
  })

  const assignMutation = useMutation({
    mutationFn: ({ id, userId }: { id: number; userId: number }) =>
      propertiesApi.assignToVerify(id, userId),
    onSuccess: (updated) => {
      invalidate()
      if (selected?.id === updated.id) setSelected(updated)
    },
  })

  // ── Derived state ────────────────────────────────────────────────────
  const displayed = useMemo(
    () => items.filter((p) => !videoOnly || p.marketingPlan === 'VideoPromotion'),
    [items, videoOnly],
  )

  const videoCount = items.filter((p) => p.marketingPlan === 'VideoPromotion').length
  const unassignedCount = items.filter((p) => p.assignedToVerifyUserId == null).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Pending Approvals
            {pendingQuery.isFetching && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.length} awaiting approval · <strong style={{ color: '#B45309' }}>{unassignedCount} unassigned</strong>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap items-center">
        <button
          onClick={() => setVideoOnly(!videoOnly)}
          className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors border-2"
          style={videoOnly
            ? { backgroundColor: '#FF5A5F', borderColor: '#FF5A5F', color: 'white' }
            : { backgroundColor: 'white', borderColor: 'rgba(255,90,95,0.35)', color: '#FF5A5F' }}
          title="Show only Video Promotion submissions">
          <Video className="w-3.5 h-3.5" />
          Video Promotion
          <span className="text-xs px-1.5 py-0.5 rounded-full"
            style={videoOnly
              ? { backgroundColor: 'rgba(255,255,255,0.25)', color: 'white' }
              : { backgroundColor: 'rgba(255,90,95,0.10)', color: '#FF5A5F' }}>
            {videoCount}
          </span>
        </button>
      </div>

      <div className={`grid gap-5 ${selected ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        <div className={selected ? 'lg:col-span-2' : ''}>
          <div className="space-y-3">
            {/* Loading / error / empty */}
            {pendingQuery.isLoading ? (
              <div className="bg-white rounded-xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">
                <Loader2 className="w-7 h-7 animate-spin mx-auto mb-3" />
                <p className="text-sm">Loading pending properties…</p>
              </div>
            ) : pendingQuery.isError ? (
              <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-sm text-red-600 mb-3">Failed to load pending properties.</p>
                <button onClick={() => pendingQuery.refetch()}
                  className="text-xs font-semibold underline" style={{ color: '#FF5A5F' }}>
                  Try again
                </button>
              </div>
            ) : displayed.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">
                <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm">{videoOnly ? 'No video-promotion properties pending.' : 'Nothing in the approval queue right now.'}</p>
              </div>
            ) : displayed.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-5 shadow-sm border transition-all cursor-pointer relative"
                style={selected?.id === item.id
                  ? { borderColor: '#FF5A5F', boxShadow: '0 0 0 2px rgba(255,90,95,0.15)' }
                  : { borderColor: '#f3f4f6' }}
                onClick={() => setSelected(selected?.id === item.id ? null : item)}
              >
                <div className="flex items-start gap-4">
                  {/* Coral ribbon for Video Promotion */}
                  {item.marketingPlan === 'VideoPromotion' && (
                    <div className="self-stretch -my-5 -ml-5 mr-1 w-1.5 rounded-r"
                      style={{ backgroundColor: '#FF5A5F' }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700">
                        Pending
                      </span>
                      {item.marketingPlan === 'VideoPromotion' && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold text-white"
                          style={{ backgroundColor: '#FF5A5F' }}
                          title={`2% brokerage = ${formatLakhs(item.totalPrice * VIDEO_PROMOTION_FEE_RATE)}`}>
                          <Video className="w-2.5 h-2.5" />
                          Video · 2%
                        </span>
                      )}
                      {/* Assignment badge — at-a-glance verification status */}
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={item.assignedToVerifyUserId == null
                          ? { backgroundColor: 'rgba(180,83,9,0.10)', color: '#B45309' }
                          : { backgroundColor: 'rgba(99,102,241,0.10)', color: '#4F46E5' }}>
                        {item.assignedToVerifyUserId == null
                          ? <><UserPlus className="w-2.5 h-2.5" /> Unassigned</>
                          : <><UserCheck className="w-2.5 h-2.5" /> {item.assignedToVerifyName ?? 'Assigned'}</>}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {item.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5" /> {item.areaInCents} cents
                      </span>
                      <span className="font-semibold" style={{ color: '#FF5A5F' }}>{formatLakhs(item.totalPrice)}</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> {item.submittedByName ?? 'Anon'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => approveMutation.mutate({ id: item.id, action: 'approve' })}
                      disabled={approveMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-2 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                      style={{ backgroundColor: '#6A9739' }}
                      onMouseEnter={(e) => { if (!approveMutation.isPending) e.currentTarget.style.backgroundColor = '#547a2d' }}
                      onMouseLeave={(e) => { if (!approveMutation.isPending) e.currentTarget.style.backgroundColor = '#6A9739' }}
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal(item.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === Detail panel === */}
        {selected && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Property Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {/* Marketing-plan callout */}
              {selected.marketingPlan === 'VideoPromotion' ? (
                <div className="rounded-xl p-3 border-2 flex items-start gap-3"
                  style={{ backgroundColor: 'rgba(255,90,95,0.06)', borderColor: 'rgba(255,90,95,0.35)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: '#FF5A5F' }}>
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FF5A5F' }}>
                      Video Promotion · 2% brokerage
                    </div>
                    <div className="text-sm text-gray-900 font-semibold mt-0.5">
                      Approx. fee: {formatLakhs(selected.totalPrice * VIDEO_PROMOTION_FEE_RATE)}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      Schedule the video shoot once approved.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-2.5 border flex items-center gap-2 text-xs"
                  style={{ backgroundColor: '#FAFAF8', borderColor: '#EAEAE5', color: '#6B7280' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#6A9739' }} />
                  Free Listing · no brokerage
                </div>
              )}

              {/* === Verification assignment === */}
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">
                  Verification — assign to
                </div>
                <AssignPicker
                  property={selected}
                  assignees={assignees}
                  onAssign={(userId) => assignMutation.mutate({ id: selected.id, userId })}
                  isPending={assignMutation.isPending}
                />
                {selected.assignedToVerifyAt && (
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Assigned {new Date(selected.assignedToVerifyAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
                    })}. Assignee was notified via WhatsApp / SMS.
                  </p>
                )}
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Title</div>
                <div className="font-medium text-gray-900 mt-0.5">{selected.title}</div>
              </div>
              {selected.description && (
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Description</div>
                  <div className="text-gray-600 mt-0.5 leading-relaxed">{selected.description}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Area</div>
                  <div className="font-medium text-gray-900 mt-0.5">{selected.areaInCents} cents</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Price</div>
                  <div className="font-semibold mt-0.5" style={{ color: '#FF5A5F' }}>{formatLakhs(selected.totalPrice)}</div>
                </div>
              </div>
              {selected.address && (
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Address</div>
                  <div className="text-gray-600 mt-0.5">{selected.address}</div>
                </div>
              )}
              {selected.propertyType && (
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Type</div>
                  <div className="text-gray-600 mt-0.5">{TYPE_LABELS[selected.propertyType] ?? selected.propertyType}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Submitted by</div>
                <div className="text-gray-900 mt-0.5">{selected.submittedByName ?? 'Anonymous submitter'}</div>
              </div>
              {selected.submittedByPhone && (
                <a
                  href={`tel:${selected.submittedByPhone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 w-full py-2 text-sm font-medium rounded-lg transition-colors justify-center"
                  style={{ backgroundColor: 'rgba(255,90,95,0.08)', color: '#FF5A5F' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,90,95,0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,90,95,0.08)')}
                >
                  <Phone className="w-3.5 h-3.5" /> {selected.submittedByPhone}
                </a>
              )}
              {selected.features && selected.features.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Features</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.features.map((f) => (
                      <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick approve/reject in the panel too */}
            <div className="flex gap-2 mt-5 pt-5 border-t border-gray-100">
              <button
                onClick={() => approveMutation.mutate({ id: selected.id, action: 'approve' })}
                disabled={approveMutation.isPending}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#6A9739' }}
              >
                {approveMutation.isPending
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Approving…</>
                  : <><Check className="w-3.5 h-3.5" /> Approve</>}
              </button>
              <button
                onClick={() => setShowRejectModal(selected.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {showRejectModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowRejectModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(220,38,38,0.10)', color: '#DC2626' }}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900">Reject this submission?</h2>
                <p className="text-sm text-gray-600 mt-1">
                  The seller will be notified with the reason you provide.
                </p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Reason (sent to seller)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="e.g. Missing EC / Patta documents; need clearer photos…"
                className="input-field resize-none text-sm"
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => { setShowRejectModal(null); setRejectReason('') }}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={() => approveMutation.mutate({
                    id: showRejectModal!,
                    action: 'reject',
                    reason: rejectReason.trim() || undefined,
                  })}
                  disabled={approveMutation.isPending}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-60"
                  style={{ backgroundColor: '#DC2626' }}>
                  {approveMutation.isPending ? 'Rejecting…' : 'Reject submission'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────── Assign-to picker ─────────────────── */

function AssignPicker({
  property, assignees, onAssign, isPending,
}: {
  property: Property
  assignees: AdminUser[]
  onAssign: (userId: number) => void
  isPending: boolean
}) {
  const [open, setOpen] = useState(false)
  const currentName = property.assignedToVerifyName

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-colors disabled:opacity-60"
        style={currentName
          ? { backgroundColor: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.25)' }
          : { backgroundColor: 'rgba(180,83,9,0.06)', borderColor: 'rgba(180,83,9,0.25)' }}>
        <div className="flex items-center gap-2 min-w-0">
          {currentName
            ? <UserCheck className="w-4 h-4 shrink-0" style={{ color: '#4F46E5' }} />
            : <UserPlus className="w-4 h-4 shrink-0" style={{ color: '#B45309' }} />}
          <span className="text-sm font-semibold truncate"
            style={{ color: currentName ? '#4F46E5' : '#B45309' }}>
            {isPending ? 'Updating…' : currentName ?? 'Assign to an employee →'}
          </span>
        </div>
        {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />}
      </button>

      {open && !isPending && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-64 overflow-y-auto">
          {assignees.length === 0 ? (
            <div className="px-4 py-4 text-xs text-gray-400 text-center">
              No active Employees to assign to. Add one in <strong>Users</strong>.
            </div>
          ) : (
            assignees.map((u) => {
              const isCurrent = u.id === property.assignedToVerifyUserId
              return (
                <button
                  key={u.id}
                  onClick={() => { onAssign(u.id); setOpen(false) }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: roleAccent(u.role) }}>
                      {(u.firstName[0] ?? '') + (u.lastName[0] ?? '')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                        {u.role}
                      </div>
                    </div>
                  </div>
                  {isCurrent && <Check className="w-4 h-4 shrink-0" style={{ color: '#4F46E5' }} />}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function roleAccent(role: string) {
  switch (role) {
    case 'Admin':    return '#FF5A5F'
    case 'Employee': return '#6A9739'
    case 'Agent':    return '#293237'
    default:         return '#9CA3AF'
  }
}
