export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="font-sans text-sm font-medium tracking-[0.18em] text-foreground/65">
              vveritas<span className="text-foreground/20">*</span>
            </div>
            <div className="font-sans text-[9px] tracking-[0.3em] text-foreground/20 mt-1">
              elevate your standard
            </div>
          </div>

          <div className="flex items-center gap-8">
            <a href="#" className="font-sans text-xs tracking-wider text-foreground/25 hover:text-foreground/50 transition-colors">
              privacy
            </a>
            <a href="#" className="font-sans text-xs tracking-wider text-foreground/25 hover:text-foreground/50 transition-colors">
              terms
            </a>
          </div>
        </div>

        <div className="rule-grit mt-8 mb-8" />

        <p className="font-sans text-xs text-foreground/15 text-center tracking-widest">
          &copy; 2025 vveritas<span className="text-foreground/20">*</span> all rights reserved.
        </p>
      </div>
    </footer>
  )
}
