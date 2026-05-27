/**
 * Classify a testimonial / property video URL so the player picks the
 * right embed strategy.
 *
 *  - youtube  / youtu.be / shorts  → iframe (HTML <video> can't decode them)
 *  - instagram reel / p / tv       → iframe
 *  - everything else               → native <video src=…>  (MP4 / WebM / etc.)
 *
 * The function returns the embeddable URL alongside the kind so callers
 * don't need to re-parse. Portrait formats (Shorts, Reels, IGTV) get
 * a `portrait: true` flag so the UI can swap to a 9:16-ish aspect
 * ratio and a narrower modal width.
 *
 * Shared between the public VideoTestimonials grid and the
 * admin AdminTestimonialsPage preview modal so the two stay in sync.
 */
export type VideoSource =
  | { kind: 'youtube';   src: string; portrait: boolean }
  | { kind: 'instagram'; src: string; portrait: boolean }
  | { kind: 'native';    src: string }

export function classifyVideoUrl(raw: string | null | undefined): VideoSource {
  const url = (raw ?? '').trim()
  if (!url) return { kind: 'native', src: '' }

  // ── YouTube ──────────────────────────────────────────────────────
  const shorts = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/)
  if (shorts) return { kind: 'youtube', src: `https://www.youtube.com/embed/${shorts[1]}?autoplay=1&playsinline=1`, portrait: true }
  const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/)
  if (short) return { kind: 'youtube', src: `https://www.youtube.com/embed/${short[1]}?autoplay=1`, portrait: false }
  const watch = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/)
  if (watch) return { kind: 'youtube', src: `https://www.youtube.com/embed/${watch[1]}?autoplay=1`, portrait: false }
  const embed = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/)
  if (embed) return { kind: 'youtube', src: `https://www.youtube.com/embed/${embed[1]}?autoplay=1`, portrait: false }

  // ── Instagram ────────────────────────────────────────────────────
  const igReel = url.match(/instagram\.com\/reels?\/([A-Za-z0-9_-]+)/)
  if (igReel) return { kind: 'instagram', src: `https://www.instagram.com/reel/${igReel[1]}/embed/`, portrait: true }
  const igTv = url.match(/instagram\.com\/tv\/([A-Za-z0-9_-]+)/)
  if (igTv) return { kind: 'instagram', src: `https://www.instagram.com/tv/${igTv[1]}/embed/`, portrait: true }
  const igPost = url.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/)
  if (igPost) return { kind: 'instagram', src: `https://www.instagram.com/p/${igPost[1]}/embed/`, portrait: false }

  return { kind: 'native', src: url }
}
