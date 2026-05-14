/**
 * Brand glyphs. lucide-react dropped the brand icons (Facebook, Instagram,
 * Twitter/X) and never shipped YouTube, so we maintain inline SVGs here and
 * import them everywhere a brand icon is needed.
 *
 * Each component accepts the standard `className` + `style` props so it
 * drops into icon slots the same way as any lucide component.
 */

type IconProps = {
  className?: string
  style?: React.CSSProperties
}

export function FacebookIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  )
}

export function InstagramIcon({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export function YoutubeIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M23.5 6.5a3.02 3.02 0 0 0-2.13-2.13C19.45 4 12 4 12 4s-7.45 0-9.37.37A3.02 3.02 0 0 0 .5 6.5C.13 8.42.13 12 .13 12s0 3.58.37 5.5a3.02 3.02 0 0 0 2.13 2.13C4.55 20 12 20 12 20s7.45 0 9.37-.37a3.02 3.02 0 0 0 2.13-2.13c.37-1.92.37-5.5.37-5.5s0-3.58-.37-5.5zM9.75 15.5v-7l6.25 3.5-6.25 3.5z" />
    </svg>
  )
}

export function TwitterIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
