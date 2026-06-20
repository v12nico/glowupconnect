export default function HeroSection() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Logo as background */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none"
        style={{ filter: 'blur(0.6px)' }}
      >
        <div
          style={{
            fontFamily: 'Arial, sans-serif',
            fontWeight: 200,
            fontSize: 'clamp(4rem, 17vw, 18rem)',
            color: 'hsl(0 0% 48%)',
            letterSpacing: '-0.03em',
            lineHeight: 0.9,
            whiteSpace: 'nowrap',
          }}
        >
          vveritas<span style={{ color: 'hsl(0 0% 32%)' }}>*</span>
        </div>
        <div
          style={{
            fontFamily: 'Arial, sans-serif',
            fontWeight: 200,
            fontSize: 'clamp(4rem, 17vw, 18rem)',
            color: 'hsl(0 0% 48%)',
            letterSpacing: '-0.03em',
            lineHeight: 0.9,
            whiteSpace: 'nowrap',
          }}
        >
          coaching
        </div>
      </div>

      {/* Overlay fade so content reads on top */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, hsl(0 0% 0% / 0.55) 0%, hsl(0 0% 0% / 0.2) 100%)' }} />

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto px-6">
        <p className="text-foreground/80 text-base md:text-lg leading-relaxed mb-2">
          you ever just decide you're done being the old version of yourself?
        </p>
        <p className="text-foreground/45 text-base md:text-lg leading-relaxed mb-10">
          this is that place.
        </p>
        <p className="text-foreground/25 text-[10px] tracking-[0.4em] mb-10">
          we train. we eat better. we think clearer.
        </p>

        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={() => scrollTo('tiers')}
            className="w-full text-[10px] tracking-widest bg-primary text-primary-foreground py-3.5 hover:opacity-75 transition-opacity"
          >
            view coaching tiers
          </button>
          <button
            onClick={() => scrollTo('inperson')}
            className="w-full text-[10px] tracking-widest border border-border text-foreground/35 py-3.5 hover:border-foreground/20 hover:text-foreground/55 transition-all"
          >
            in-person training
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
