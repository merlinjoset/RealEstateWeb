import { useEffect, useRef } from 'react'
import { AlertCircle, X } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  message: string
  /** Defaults to "Confirm" */
  confirmLabel?: string
  /** Defaults to "Cancel" */
  cancelLabel?: string
  /** Defaults to "danger" — red confirm button. Use "primary" for non-destructive. */
  tone?: 'danger' | 'primary'
  /** Icon at top-left of the dialog. Defaults to AlertCircle. */
  icon?: React.ComponentType<{ className?: string }>
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Lightweight modal confirmation dialog used for destructive actions like
 * sign-out, delete, etc. Closes on Escape and clicking the scrim.
 */
export default function ConfirmDialog({
  open, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  tone = 'danger', icon: Icon = AlertCircle,
  loading = false, onConfirm, onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Auto-focus the confirm button and listen for Escape
  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  const accent = tone === 'danger' ? '#DC2626' : '#FF5A5F'
  const accentSoft = tone === 'danger' ? 'rgba(220,38,38,0.10)' : 'rgba(255,90,95,0.10)'
  const accentHover = tone === 'danger' ? '#B91C1C' : '#e04a4f'

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 pb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: accentSoft, color: accent }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 id="confirm-title" className="font-bold text-gray-900 text-base leading-tight">
              {title}
            </h2>
            <p id="confirm-message" className="text-sm text-gray-600 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 -m-1 shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 pt-2 flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: accent }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = accentHover }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = accent }}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
