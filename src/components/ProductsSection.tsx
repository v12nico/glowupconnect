import { useState } from 'react'
import IntakeFormDialog from './IntakeFormDialog'
import type { IntakeVariant } from './IntakeFormDialog'
import EbookIntakeDialog from './EbookIntakeDialog'

const programs = [
  {
    name: 'custom meal plan',
    price: '$50',
    description: 'a fully personalized nutrition blueprint built around your goals, body composition, and lifestyle. no generic templates.',
    paymentLink: 'https://square.link/u/dqZrnVlA',
    variant: 'meal' as IntakeVariant,
    featured: false,
  },
  {
    name: 'custom workout',
    price: '$50',
    description: 'a tailored training program designed for your level, equipment, and objectives. progressive, structured, and purposeful.',
    paymentLink: 'https://square.link/u/KeXHxjYD',
    variant: 'workout' as IntakeVariant,
    featured: false,
  },
  {
    name: 'meal + workout bundle',
    price: '$100',
    description: 'both custom plans together — the most complete standalone package for transformation without ongoing coaching.',
    paymentLink: 'https://square.link/u/P36RVhKn',
    variant: 'bundle' as IntakeVariant,
    featured: true,
  },
]

const ebooks = [
  {
    name: 'the discipline protocol',
    subtitle: 'e-book',
    price: '$25',
    description: 'the mental framework behind elite-level consistency. learn to build discipline as a system, not a feeling.',
    paymentLink: 'https://square.link/u/ebook-discipline',
    downloadUrl: 'https://vveritaslife.com/ebooks/discipline-protocol.pdf',
  },
  {
    name: 'strength foundations',
    subtitle: 'e-book',
    price: '$25',
    description: 'everything you need to build a strength base from the ground up — programming principles, movement patterns, and progression.',
    paymentLink: 'https://square.link/u/ebook-strength',
    downloadUrl: 'https://vveritaslife.com/ebooks/strength-foundations.pdf',
  },
]

export default function ProductsSection() {
  const [programDialog, setProgramDialog] = useState<{
    open: boolean
    variant: IntakeVariant
    name: string
    paymentLink: string
  }>({ open: false, variant: 'meal', name: '', paymentLink: '' })

  const [ebookDialog, setEbookDialog] = useState<{
    open: boolean
    ebookName: string
    paymentLink: string
    downloadUrl: string
  }>({ open: false, ebookName: '', paymentLink: '', downloadUrl: '' })

  const openProgram = (variant: IntakeVariant, name: string, paymentLink: string) => {
    setProgramDialog({ open: true, variant, name, paymentLink })
  }

  const openEbook = (ebook: typeof ebooks[0]) => {
    setEbookDialog({ open: true, ebookName: ebook.name, paymentLink: ebook.paymentLink, downloadUrl: ebook.downloadUrl })
  }

  return (
    <section id="products" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-sans text-[10px] tracking-[0.5em] text-foreground/25">resources</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3">
            programs & resources
          </h2>
          <div className="rule-grit max-w-xs mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border mb-16">
          {programs.map(program => (
            <div key={program.name} className="relative bg-card flex flex-col">
              {program.featured && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary opacity-50" />
              )}
              <div className="p-8 flex flex-col flex-1">
                {program.featured && (
                  <div className="mb-4">
                    <span className="font-sans text-[9px] tracking-[0.35em] text-foreground/35 border border-border px-3 py-1">
                      best value
                    </span>
                  </div>
                )}
                <h3 className="font-display text-xl font-bold text-foreground/80 mb-2">
                  {program.name}
                </h3>
                <div className="font-display text-3xl font-bold text-foreground/65 mb-4">{program.price}</div>
                <p className="font-sans text-sm text-foreground/45 leading-relaxed flex-1 mb-6 font-light">
                  {program.description}
                </p>
                <button
                  onClick={() => openProgram(program.variant, program.name, program.paymentLink)}
                  className="w-full font-sans text-xs tracking-widest bg-primary text-primary-foreground py-4 hover:opacity-75 transition-opacity"
                >
                  get started
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="text-center mb-10">
            <h3 className="font-display text-2xl font-bold text-foreground/75">
              knowledge base
            </h3>
            <p className="font-sans text-sm text-foreground/30 mt-2 font-light">
              digital resources to sharpen your edge
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-border max-w-3xl mx-auto">
            {ebooks.map(ebook => (
              <div key={ebook.name} className="bg-card p-8 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="font-sans text-[9px] tracking-[0.4em] text-foreground/25">
                      {ebook.subtitle}
                    </span>
                    <h4 className="font-display text-lg font-bold text-foreground/75 mt-1">
                      {ebook.name}
                    </h4>
                  </div>
                  <div className="font-display text-2xl font-bold text-foreground/55 ml-4">{ebook.price}</div>
                </div>
                <p className="font-sans text-sm text-foreground/45 leading-relaxed flex-1 mb-6 font-light">
                  {ebook.description}
                </p>
                <button
                  onClick={() => openEbook(ebook)}
                  className="w-full font-sans text-xs tracking-widest border border-border text-foreground/40 py-3.5 hover:border-foreground/25 hover:text-foreground/65 transition-all"
                >
                  buy now — {ebook.price}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <IntakeFormDialog
        open={programDialog.open}
        onClose={() => setProgramDialog(p => ({ ...p, open: false }))}
        variant={programDialog.variant}
        tierName={programDialog.name}
        paymentLink={programDialog.paymentLink}
      />

      <EbookIntakeDialog
        open={ebookDialog.open}
        onClose={() => setEbookDialog(p => ({ ...p, open: false }))}
        ebookName={ebookDialog.ebookName}
        paymentLink={ebookDialog.paymentLink}
        downloadUrl={ebookDialog.downloadUrl}
      />
    </section>
  )
}
