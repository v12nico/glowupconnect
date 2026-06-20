import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type IntakeVariant = 'tier' | 'meal' | 'workout' | 'bundle' | 'inperson'

interface IntakeFormDialogProps {
  open: boolean
  onClose: () => void
  variant: IntakeVariant
  tierName: string
  paymentLink: string
}

const INPERSON_AREAS = [
  'MD — Southern: Waldorf',
  'MD — Southern: Clinton',
  'MD — Southern: Brandywine',
  'MD — Southern: PG County',
  'MD — Central: Towson',
  'MD — Central: Baltimore',
  'MD — Central: Greater Baltimore',
  'TX: Houston',
  'TX: Dallas',
  'TX: Fort Worth',
]

export default function IntakeFormDialog({
  open,
  onClose,
  variant,
  tierName,
  paymentLink,
}: IntakeFormDialogProps) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', age: '', height: '', weight: '',
    goals: '', accommodations: '', location: '', preferredTrainer: 'no preference',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setSubmitted(false); setError('')
      setForm({ name: '', email: '', phone: '', age: '', height: '', weight: '',
        goals: '', accommodations: '', location: '', preferredTrainer: 'no preference' })
    }
  }, [open])

  if (!open) return null

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    window.open(paymentLink, '_blank')
    try {
      const basePayload = variant === 'inperson'
        ? { tier_name: 'In-Person Training', name: form.name, email: form.email, phone: form.phone, goals: form.goals, accommodations: form.location }
        : { tier_name: tierName, name: form.name, email: form.email, phone: form.phone, age: form.age, height: form.height, weight: form.weight, goals: form.goals, accommodations: form.accommodations }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from('applications').insert(basePayload as any)
      setSubmitted(true)
    } catch {
      setError('submission had an issue, but your payment window opened. contact us if needed.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full bg-muted border border-border px-4 py-3 text-foreground placeholder-foreground/25 font-sans text-sm focus:outline-none focus:border-primary/50 transition-colors'
  const labelClass = 'block font-sans text-[9px] tracking-[0.4em] text-foreground/30 mb-2'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      <div className="relative bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {variant === 'inperson' ? 'book in-person training' : `apply — ${tierName}`}
            </h2>
            <p className="font-sans text-[10px] text-foreground/30 mt-1 tracking-wide">
              complete the form — your payment link opens automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/25 hover:text-foreground/60 transition-colors text-2xl leading-none ml-4"
          >
            &times;
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4 text-foreground/50">&#10003;</div>
            <h3 className="font-display text-lg font-bold text-foreground/75 mb-2">
              application submitted
            </h3>
            <p className="font-sans text-sm text-foreground/40 font-light">
              your payment window opened. complete checkout to secure your spot. we&apos;ll follow up within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-6 font-sans text-xs tracking-widest bg-primary text-primary-foreground px-6 py-3 hover:opacity-75 transition-opacity"
            >
              close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className={labelClass}>full name *</label>
              <input required className={inputClass} placeholder="your name" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className={labelClass}>email *</label>
              <input required type="email" className={inputClass} placeholder="your@email.com" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className={labelClass}>phone *</label>
              <input required className={inputClass} placeholder="(555) 000-0000" value={form.phone} onChange={set('phone')} />
            </div>

            {variant === 'inperson' ? (
              <>
                <div>
                  <label className={labelClass}>your area *</label>
                  <select required className={inputClass} value={form.location} onChange={set('location')}>
                    <option value="">select your area</option>
                    {INPERSON_AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>preferred trainer</label>
                  <select className={inputClass} value={form.preferredTrainer} onChange={set('preferredTrainer')}>
                    <option>no preference</option>
                    <option>nico</option>
                    <option>ahraya</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>goals *</label>
                  <textarea required className={inputClass + ' resize-none'} rows={3} placeholder="what are you training toward?" value={form.goals} onChange={set('goals')} />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>age</label>
                    <input className={inputClass} placeholder="28" value={form.age} onChange={set('age')} />
                  </div>
                  <div>
                    <label className={labelClass}>height</label>
                    <input className={inputClass} placeholder="5'10&quot;" value={form.height} onChange={set('height')} />
                  </div>
                  <div>
                    <label className={labelClass}>weight</label>
                    <input className={inputClass} placeholder="185 lbs" value={form.weight} onChange={set('weight')} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>your goals *</label>
                  <textarea required className={inputClass + ' resize-none'} rows={3} placeholder="what are you training toward? be specific." value={form.goals} onChange={set('goals')} />
                </div>
                <div>
                  <label className={labelClass}>injuries / accommodations</label>
                  <textarea className={inputClass + ' resize-none'} rows={2} placeholder="any injuries or limitations we should know about?" value={form.accommodations} onChange={set('accommodations')} />
                </div>
              </>
            )}

            {error && <p className="font-sans text-xs text-foreground/50">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full font-sans text-xs tracking-widest bg-primary text-primary-foreground py-4 hover:opacity-75 transition-opacity disabled:opacity-40 mt-2"
            >
              {submitting ? 'submitting...' : 'submit & proceed to payment'}
            </button>
            <p className="font-sans text-[10px] text-foreground/25 text-center">
              clicking submit opens your secure checkout in a new tab.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
