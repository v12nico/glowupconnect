import { useState } from 'react'
import IntakeFormDialog from './IntakeFormDialog'

const trainers = [
  {
    key: 'nico',
    label: 'dmv area',
    title: 'head coach — nico',
    bio: 'nico brings elite-level coaching to the dmv. strength, conditioning, and discipline as a lifestyle — he trains the mind and the body.',
    areas: [
      {
        region: 'maryland — southern',
        locations: ['waldorf', 'clinton', 'brandywine', 'pg county'],
      },
      {
        region: 'maryland — central',
        locations: ['towson', 'baltimore', 'greater baltimore'],
      },
    ],
    cta: 'book with nico',
    paymentLink: 'https://buy.stripe.com/cNidR9aCy5Yu6lQcOR6wE07',
    featured: true,
  },
  {
    key: 'ahraya',
    label: 'texas',
    title: 'coach — ahraya',
    bio: 'ahraya coaches across texas with a focus on functional fitness, strength training, and accountability-based transformation.',
    areas: [
      {
        region: 'texas',
        locations: ['houston', 'dallas', 'fort worth'],
      },
    ],
    cta: 'book with ahraya',
    paymentLink: 'https://square.link/u/placeholder-ahraya',
    featured: false,
  },
]

export default function InPersonSection() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activePaymentLink, setActivePaymentLink] = useState('')
  const [activeName, setActiveName] = useState('')

  const openDialog = (paymentLink: string, name: string) => {
    setActivePaymentLink(paymentLink)
    setActiveName(name)
    setDialogOpen(true)
  }

  return (
    <section id="inperson" className="py-24 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-sans text-[10px] tracking-[0.5em] text-foreground/25">local training</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3">
            in-person training
          </h2>
          <p className="font-sans text-sm text-foreground/35 mt-4 max-w-sm mx-auto font-light tracking-wide">
            train face to face. same standards, same results.
          </p>
          <div className="rule-grit max-w-xs mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-border mb-10">
          {trainers.map(trainer => (
            <div key={trainer.key} className="relative bg-card flex flex-col">
              {trainer.featured && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary opacity-50" />
              )}

              <div className="p-8 flex flex-col flex-1">
                <div className="mb-4">
                  <span className="font-sans text-[9px] tracking-[0.4em] text-foreground/25">
                    {trainer.label}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-foreground/80 mt-1">
                    {trainer.title}
                  </h3>
                </div>

                <p className="font-sans text-sm text-foreground/45 leading-relaxed mb-8 font-light">
                  {trainer.bio}
                </p>

                <div className="mb-8 flex-1">
                  {trainer.areas.map(area => (
                    <div key={area.region} className="mb-5">
                      <div className="font-sans text-[9px] tracking-[0.4em] text-foreground/25 mb-2">
                        {area.region}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {area.locations.map(loc => (
                          <span
                            key={loc}
                            className="border border-border text-foreground/40 font-sans text-xs px-3 py-1"
                          >
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => openDialog(trainer.paymentLink, trainer.title)}
                  className={`w-full font-sans text-xs tracking-widest py-4 transition-opacity hover:opacity-75 ${
                    trainer.featured
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-foreground/40 hover:border-foreground/25 hover:text-foreground/65'
                  }`}
                >
                  {trainer.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center font-sans text-xs text-foreground/25 tracking-wide">
          not in these areas?{' '}
          <button
            onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-foreground/40 underline underline-offset-2 hover:text-foreground/60 transition-colors"
          >
            remote coaching is available in all tiers.
          </button>
        </p>
      </div>

      <IntakeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        variant="inperson"
        tierName={activeName}
        paymentLink={activePaymentLink}
      />
    </section>
  )
}
