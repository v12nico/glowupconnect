import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

type Step = 'form' | 'check-email'

export default function Signup() {
  const navigate          = useNavigate()
  const [step, setStep]   = useState<Step>('form')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('password must be at least 6 characters'); return }
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    if (data.session) {
      navigate('/onboarding')
    } else {
      setStep('check-email')
    }
    setLoading(false)
  }

  if (step === 'check-email') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center space-y-6">
        <h1 className="font-display text-3xl font-bold glow-text">check your email.</h1>
        <p className="text-muted-foreground leading-relaxed">
          we sent a link to <span className="text-foreground font-bold">{email}</span>.
          click it to verify, then sign in.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-3.5 bg-primary text-primary-foreground rounded-xl font-display font-bold glow-shadow"
        >
          Go to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6">
      <div className="flex-1 flex flex-col justify-center space-y-10 pt-16">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold glow-text">GlowUp.</h1>
          <p className="text-muted-foreground">start your transformation.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email"
            className="w-full bg-card border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-base"
          />
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="password (min 6 characters)"
            className="w-full bg-card border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-base"
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
        </form>
      </div>

      <div className="pb-10 space-y-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit as unknown as React.MouseEventHandler}
          disabled={loading || !email || !password}
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-display font-bold text-base glow-shadow disabled:opacity-40 transition-opacity"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </motion.button>
        <p className="text-center text-sm text-muted-foreground">
          already have one?{' '}
          <Link to="/login" className="text-primary font-bold">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
