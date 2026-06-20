export default function Navbar() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col leading-none">
          <span className="font-sans text-sm font-medium tracking-[0.18em] text-foreground/85">
            vveritas<span className="text-foreground/30">*</span>
          </span>
          <span className="font-sans text-[9px] tracking-[0.3em] text-foreground/25 mt-0.5">
            elevate your standard
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'coaching', id: 'tiers' },
            { label: 'in-person', id: 'inperson' },
            { label: 'programs', id: 'products' },
            { label: 'faq', id: 'faq' },
            { label: 'contact', id: 'contact' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="font-sans text-xs text-foreground/35 hover:text-foreground/65 transition-colors tracking-widest"
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollTo('tiers')}
          className="font-sans text-xs tracking-widest bg-primary text-primary-foreground px-5 py-2.5 hover:opacity-75 transition-opacity"
        >
          get started
        </button>
      </div>
    </nav>
  )
}
