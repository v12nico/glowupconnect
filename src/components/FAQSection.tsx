import { useState } from 'react'

const faqs = [
  {
    q: 'how do i get started?',
    a: "choose your tier, fill out the intake form, and complete payment. you'll be contacted within 24 hours to kick things off.",
  },
  {
    q: "what's the difference between the tiers?",
    a: 'blueprint is plan-only — custom programming and a nutrition blueprint. mentorship adds weekly coaching, direct messaging, and form review. competitor is full-service daily coaching for those who need every edge.',
  },
  {
    q: 'is in-person training available everywhere?',
    a: 'nico covers the dmv area — waldorf, clinton, brandywine, pg county, towson, baltimore, and greater baltimore. ahraya covers houston, dallas, and fort worth. remote coaching is available anywhere through all tiers.',
  },
  {
    q: 'how does payment work?',
    a: "after submitting your intake form, you'll be redirected to complete payment securely. your spot is reserved once payment is confirmed.",
  },
  {
    q: "what if i'm a beginner?",
    a: "all tiers are designed for any experience level. the blueprint is a great entry point — it gives you a complete, customized system to follow without being overwhelming.",
  },
  {
    q: 'can i upgrade my tier?',
    a: "yes. contact us and we'll apply your previous payment as credit toward the upgrade.",
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i))

  return (
    <section id="faq" className="py-24 bg-card border-y border-border">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-sans text-[10px] tracking-[0.5em] text-foreground/25">questions</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3">
            faq
          </h2>
          <div className="rule-grit max-w-xs mx-auto mt-6" />
        </div>

        <div className="space-y-px">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-background border border-border overflow-hidden">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left group"
              >
                <span className="font-sans text-sm text-foreground/55 group-hover:text-foreground/75 transition-colors tracking-wide font-light">
                  {faq.q}
                </span>
                <span
                  className={`text-foreground/25 text-xl leading-none ml-4 transition-transform duration-200 select-none ${
                    openIndex === i ? 'rotate-45' : ''
                  }`}
                >
                  +
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <div className="border-t border-border pt-4">
                    <p className="font-sans text-sm text-foreground/40 leading-relaxed font-light">{faq.a}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
