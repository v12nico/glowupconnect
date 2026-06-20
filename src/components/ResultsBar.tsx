const stats = [
  { number: '500+', label: 'clients coached' },
  { number: '4+', label: 'years experience' },
  { number: '3', label: 'coaching tiers' },
  { number: '100%', label: 'real results only' },
]

export default function ResultsBar() {
  return (
    <section id="results" className="bg-card border-y border-border py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {stats.map(({ number, label }) => (
            <div key={label} className="text-center px-6 py-2">
              <div className="font-display text-4xl md:text-5xl font-bold text-foreground/80 mb-1">
                {number}
              </div>
              <div className="font-sans text-[9px] tracking-[0.3em] text-foreground/30">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
