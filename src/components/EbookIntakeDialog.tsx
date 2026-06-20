import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface EbookIntakeDialogProps {
  open: boolean
  onClose: () => void
  ebookName: string
  paymentLink: string
  downloadUrl: string
}

export default function EbookIntakeDialog({
  open,
  onClose,
  ebookName,
  paymentLink,
  downloadUrl,
}: EbookIntakeDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) { setName(''); setEmail(''); setSubmitted(false); setError('') }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    window.open(paymentLink, '_blank')
    try {
      await supabase.functions.invoke('send-ebook', {
        body: { name, email, ebookName, downloadUrl },
      })
      setSubmitted(true)
    } catch {
      setError('submission had an issue, but your payment window opened. contact us for delivery.')
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
      <div className="relative bg-card border border-border w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              get the e-book
            </h2>
            <p className="font-sans text-xs text-foreground/35 mt-1">{ebookName}</p>
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
              order placed
            </h3>
            <p className="font-sans text-sm text-foreground/40 font-light">
              your payment window opened. after checkout, the e-book will be sent to your email.
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
              <input required className={inputClass} placeholder="your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>email *</label>
              <input required type="email" className={inputClass} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            {error && <p className="font-sans text-xs text-foreground/50">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full font-sans text-xs tracking-widest bg-primary text-primary-foreground py-4 hover:opacity-75 transition-opacity disabled:opacity-40 mt-2"
            >
              {submitting ? 'processing...' : 'get my copy — $25'}
            </button>
            <p className="font-sans text-[10px] text-foreground/25 text-center">
              secure checkout. e-book delivered to your inbox.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
