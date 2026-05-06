interface PageHeaderProps {
  eyebrow?: string
  title: string
  highlight?: string         // optional word inside the title to render in coral
  description?: string
  align?: 'left' | 'center'  // default 'center'
  children?: React.ReactNode // optional slot for CTAs / chips
}

/**
 * Shared editorial-style header used on About, Contact, and other secondary pages.
 * - Warm cream background (#F8F6F3)
 * - Soft coral + olive decorative blobs
 * - Eyebrow flanked by coral hairlines
 * - Optional highlighted word inside the title
 */
export default function PageHeader({
  eyebrow,
  title,
  highlight,
  description,
  align = 'center',
  children,
}: PageHeaderProps) {
  // Render the title — replace `highlight` substring with a coral span
  const renderTitle = () => {
    if (!highlight || !title.includes(highlight)) {
      return title
    }
    const parts = title.split(highlight)
    return (
      <>
        {parts[0]}
        <span style={{ color: '#FF5A5F' }}>{highlight}</span>
        {parts[1] ?? ''}
      </>
    )
  }

  const isCenter = align === 'center'

  return (
    <section
      className="relative overflow-hidden py-20 md:py-24"
      style={{ backgroundColor: '#F8F6F3' }}
    >
      {/* Decorative brand blobs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.08] -translate-y-1/3 translate-x-1/4 pointer-events-none"
        style={{ backgroundColor: '#FF5A5F' }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-[0.08] translate-y-1/3 -translate-x-1/4 pointer-events-none"
        style={{ backgroundColor: '#6A9739' }}
      />

      <div
        className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isCenter ? 'text-center' : 'text-left'
        }`}
      >
        {/* Eyebrow */}
        {eyebrow && (
          <div
            className={`inline-flex items-center gap-3 mb-6 ${
              isCenter ? 'justify-center' : ''
            }`}
          >
            <div className="h-px w-10" style={{ backgroundColor: '#FF5A5F' }} />
            <span
              className="text-[11px] font-semibold tracking-[0.25em] uppercase"
              style={{ color: '#FF5A5F' }}
            >
              {eyebrow}
            </span>
            {isCenter && (
              <div className="h-px w-10" style={{ backgroundColor: '#FF5A5F' }} />
            )}
          </div>
        )}

        {/* Headline */}
        <h1
          className="text-4xl md:text-5xl font-bold mb-5 leading-tight tracking-tight"
          style={{ color: '#111111' }}
        >
          {renderTitle()}
        </h1>

        {/* Description */}
        {description && (
          <p
            className={`text-lg leading-relaxed ${
              isCenter ? 'max-w-2xl mx-auto' : 'max-w-2xl'
            }`}
            style={{ color: '#4B5563' }}
          >
            {description}
          </p>
        )}

        {/* Optional CTAs / extra content */}
        {children && (
          <div className={`mt-8 ${isCenter ? 'flex justify-center' : ''}`}>
            {children}
          </div>
        )}
      </div>
    </section>
  )
}
