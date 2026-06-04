import { useState, useEffect, useRef } from 'react'
import {
  Share2, MessageCircle, Mail, Link2, Send,
  Copy, Check, X,
} from 'lucide-react'

/* ── Inline brand SVGs (lucide-react dropped brand icons) ─────────── */
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
  </svg>
)

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

interface Props {
  /** Public URL to share — defaults to window.location.href */
  url?: string
  /** Headline text used in social posts */
  title: string
  /** Optional longer description (used in post body where supported) */
  description?: string
  /** Variant — full button on detail pages, icon-only on cards */
  variant?: 'button' | 'icon'
  className?: string
}

export default function ShareButton({
  url, title, description, variant = 'button', className = '',
}: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState(url ?? '')
  const menuRef = useRef<HTMLDivElement>(null)

  // Resolve the URL once mounted (window isn't available at SSR-build time)
  useEffect(() => {
    if (!url) setShareUrl(window.location.href)
  }, [url])

  // Close on click-outside
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  /* ── Encoded helpers ─────────────────────────────── */
  const u = encodeURIComponent(shareUrl)
  const t = encodeURIComponent(title)
  const d = encodeURIComponent(description ?? '')
  const fullText = encodeURIComponent(
    `${title}${description ? `\n\n${description}` : ''}\n\n${shareUrl}`,
  )

  /* ── Native Web Share (mobile / supported browsers) ── */
  const tryNativeShare = async () => {
    if (typeof navigator === 'undefined' || !navigator.share) return false
    try {
      await navigator.share({ title, text: description ?? title, url: shareUrl })
      return true
    } catch {
      return false
    }
  }

  const handleClick = async () => {
    // On mobile, native share-sheet is the best UX (covers IG, WhatsApp, etc.)
    if (await tryNativeShare()) return
    // Otherwise fall back to our custom menu
    setOpen((prev) => !prev)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard API blocked — fall back to a temporary input
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  const openInstagram = async () => {
    // Instagram has no direct web-share URL — copy link, then nudge user
    await copyLink()
    // Tiny delay so user sees the "copied" feedback before tab opens
    setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    }, 300)
  }

  /* ── Share targets ──────────────────────────────────── */
  const SHARES = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      color: '#25D366',
      bg: 'rgba(37,211,102,0.1)',
      href: `https://wa.me/?text=${fullText}`,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: FacebookIcon,
      color: '#1877F2',
      bg: 'rgba(24,119,242,0.1)',
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}`,
    },
    {
      key: 'twitter',
      label: 'X / Twitter',
      icon: TwitterIcon,
      color: '#000000',
      bg: 'rgba(0,0,0,0.06)',
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: Send,
      color: '#26A5E4',
      bg: 'rgba(38,165,228,0.1)',
      href: `https://t.me/share/url?url=${u}&text=${t}`,
    },
    {
      key: 'email',
      label: 'Email',
      icon: Mail,
      color: '#6A9739',
      bg: 'rgba(106,151,57,0.10)',
      href: `mailto:?subject=${t}&body=${d}%0A%0A${u}`,
    },
  ]

  /* ── Render ─────────────────────────────────────────── */
  const trigger = variant === 'icon' ? (
    <button onClick={handleClick}
      title="Share"
      className={`p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${className}`}>
      <Share2 className="w-4 h-4 text-gray-400" />
    </button>
  ) : (
    <button onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${className}`}
      style={{ borderColor: '#CFD8DC', color: '#374151' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAFAF8')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
      <Share2 className="w-4 h-4" /> Share
    </button>
  )

  return (
    <div className="relative inline-block" ref={menuRef}>
      {trigger}

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" style={{ color: '#FF5A5F' }} />
              <span className="text-sm font-bold" style={{ color: '#111111' }}>
                Share this property
              </span>
            </div>
            <button onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 -m-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Social grid */}
          <div className="grid grid-cols-3 gap-1 p-2">
            {SHARES.map((s) => {
              const Icon = s.icon
              return (
                <a key={s.key}
                  href={s.href}
                  target={s.key === 'email' ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 transition-colors text-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: s.bg, color: s.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: '#374151' }}>
                    {s.label}
                  </span>
                </a>
              )
            })}

            {/* Instagram — special handling (no URL share) */}
            <button onClick={openInstagram}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 transition-colors text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)' }}>
                <InstagramIcon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium" style={{ color: '#374151' }}>
                Instagram
              </span>
            </button>
          </div>

          {/* Copy-link row */}
          <div className="border-t border-gray-100 p-3 bg-gray-50">
            <button onClick={copyLink}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors">
              <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="flex-1 text-xs font-mono truncate text-gray-600 text-left">
                {shareUrl}
              </span>
              {copied ? (
                <span className="text-xs font-semibold inline-flex items-center gap-1 shrink-0" style={{ color: '#6A9739' }}>
                  <Check className="w-3.5 h-3.5" /> Copied
                </span>
              ) : (
                <span className="text-xs font-semibold inline-flex items-center gap-1 shrink-0" style={{ color: '#FF5A5F' }}>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </span>
              )}
            </button>
            <p className="text-[10px] text-gray-400 mt-2 leading-snug">
              💡 Instagram doesn't support direct link sharing —
              we copied the link so you can paste it into a story or DM.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
