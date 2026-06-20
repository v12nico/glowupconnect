export default function ContactSection() {
  return (
    <section id="contact" className="py-24 bg-background">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <span className="font-sans text-[10px] tracking-[0.5em] text-foreground/25">get in touch</span>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-10">
          reach us
        </h2>

        <div className="bg-card border border-border p-10">
          <div className="mb-6">
            <p className="font-sans text-[9px] tracking-[0.4em] text-foreground/25 mb-3">email</p>
            <a
              href="mailto:team@vveritaslife.com"
              className="font-sans text-xl text-foreground/65 hover:text-foreground/85 transition-colors tracking-wide"
            >
              team@vveritaslife.com
            </a>
          </div>

          <div className="rule-grit my-6" />

          <p className="font-sans text-sm text-foreground/35 leading-relaxed font-light">
            for the quickest response, use the intake form tied to the program you&apos;re interested in.
            direct email is best for general questions and partnership inquiries.
          </p>
        </div>
      </div>
    </section>
  )
}
