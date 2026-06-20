import { useState } from 'react'
import IntakeFormDialog from './IntakeFormDialog'
import type { IntakeVariant } from './IntakeFormDialog'

const tiers = [
  {
    name: 'the blueprint',
    tierLabel: 'tier one',
    price: '$250',
    frequency: 'one-time',
    paymentLink: 'https://square.link/u/M0waSxGL',
    popular: false,
    features: [
      'custom workout plan',
      'nutrition blueprint',
      '30-day programming',
      'email support',
    ],
  },
  {
    name: 'the mentorship',
    tierLabel: 'tier two',
    price: '$500',
    frequency: '',
    paymentLink: 'https://square.link/u/3UX3575S',
    popular: true,
    features: [
      'everything in blueprint',
      'weekly check-ins',
      'form review via video',
      'direct messaging',
      '60-day programming',
    ],
  },
  {
    name: 'the competitor',
    tierLabel: 'tier three',
    price: '$1,000',
    frequency: '',
    paymentLink: 'https://buy.stripe.com/5kQ7sL5ieaeKcKe1696wE08',
    popular: false,
    features: [
      'everything in mentorship',
      'daily coaching access',
      'competition prep',
      'custom macro tracking',
      '90-day programming',
    ],
  },
]

export default function TiersSection() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTier, setActiveTier] = useState<{ name: string; paymentLink: string } | null>(null)

  const openDialog = (tier: { name: string; paymentLink: string }) => {
    setActiveTier(tier)
    setDialogOpen(true)
  }

  return (
    <section id="tiers" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-sans text-[10px] tracking-[0.5em] text-foreground/25">coaching</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3">
            choose your tier
          </h2>
          <div className="rule-grit max-w-xs mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border">
          {tiers.map(tier => (
            <div
              key={tier.name}
              className="relative bg-card flex flex-col"
            >
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary opacity-60" />
              )}

              <div className="p-8 flex flex-col flex-1">
                {tier.popular && (
                  <div className="mb-4">
                    <span className="font-sans text-[9px] tracking-[0.35em] text-foreground/40 border border-border px-3 py-1">
                      most popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <span className="font-sans text-[9px] tracking-[0.4em] text-foreground/25">
                    {tier.tierLabel}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-foreground mt-1">
                    {tier.name}
                  </h3>
                </div>

                <div className="mb-8">
                  <div className="font-display text-5xl font-bold text-foreground/75">
                    {tier.price}
                  </div>
                  {tier.frequency && (
                    <div className="font-sans text-xs text-foreground/25 mt-1 tracking-wider">{tier.frequency}</div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map(feat => (
                    <li key={feat} className="flex items-start gap-3">
                      <span className="text-foreground/20 mt-0.5">—</span>
                      <span className="font-sans text-sm text-foreground/55 font-light">{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => openDialog({ name: tier.name, paymentLink: tier.paymentLink })}
                  className={`w-full font-sans text-xs tracking-widest py-4 transition-opacity hover:opacity-75 ${
                    tier.popular
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-foreground/45 hover:border-foreground/25 hover:text-foreground/70'
                  }`}
                >
                  get started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeTier && (
        <IntakeFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          variant={'tier' as IntakeVariant}
          tierName={activeTier.name}
          paymentLink={activeTier.paymentLink}
        />
      )}
    </section>
  )
}
