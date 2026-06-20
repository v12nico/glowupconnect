const testimonials = [
  {
    name: 'marcus t.',
    result: 'lost 34 lbs in 16 weeks',
    quote:
      "i've worked with trainers before but nothing like this. the blueprint gave me structure i didn't know i was missing. nico doesn't let you coast — you get a plan, you follow it, and the results follow.",
  },
  {
    name: 'jasmine r.',
    result: "gained 12 lbs of muscle, pr'd her deadlift",
    quote:
      "i came in skeptical. i'd spent two years spinning my wheels at the gym. the mentorship tier completely changed my approach — the weekly check-ins kept me locked in, and the form review fixed everything holding me back.",
  },
  {
    name: 'devon k.',
    result: '90-day competition prep, stage ready',
    quote:
      "if you're serious about competing, the competitor tier is non-negotiable. daily access to a coach who actually holds you accountable changed everything. my macros were dialed, my training was on point.",
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-sans text-[10px] tracking-[0.5em] text-foreground/25">results</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3">
            they put in the work
          </h2>
          <div className="rule-grit max-w-xs mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border">
          {testimonials.map(({ name, result, quote }) => (
            <div key={name} className="bg-card p-8 flex flex-col">
              <div className="font-display text-6xl font-bold text-foreground/[0.06] leading-none mb-6 select-none">&ldquo;</div>
              <p className="font-sans text-sm text-foreground/50 leading-relaxed flex-1 mb-8 font-light italic">{quote}</p>
              <div className="border-t border-border pt-5">
                <div className="font-sans font-medium tracking-widest text-foreground/65 text-xs">
                  {name}
                </div>
                <div className="font-sans text-xs text-foreground/25 mt-1 tracking-wide">{result}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
