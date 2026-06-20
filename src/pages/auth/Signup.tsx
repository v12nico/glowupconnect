import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

type Step = 'form' | 'check-email'

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep]         = useState<Step>('form')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError('passwords do not match'); return }
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    if (data.session) {
      // email confirmation is off — signed in immediately
      navigate('/onboarding')
    } else {
      // email confirmation is on — tell them to check their inbox
      setStep('check-email')
    }
    setLoading(false)
  }

  if (step === 'check-email') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <h1 className="font-display text-3xl glow-text">check your email</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            we sent a confirmation link to <span className="text-foreground">{email}</span>.
            click it to activate your account, then come back here to sign in.
          </p>
          <Link
            to="/login"
            className="inline-block text-sm text-primary hover:underline"
          >
            go to sign in →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <h1 className="font-display text-3xl glow-text">GlowUp</h1>
          <p className="text-muted-foreground text-sm">start your transformation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground tracking-widest uppercase">email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-card border border-border rounded-DEFAULT px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-glow transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground tracking-widest uppercase">password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-card border border-border rounded-DEFAULT px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-glow transition-colors"
              placeholder="min 6 characters"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground tracking-widest uppercase">confirm password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full bg-card border border-border rounded-DEFAULT px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-glow transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-DEFAULT font-display font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 glow-shadow"
          >
            {loading ? 'creating account…' : 'create account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          already have one?{' '}
          <Link to="/login" className="text-primary hover:underline">sign in</Link>
        </p>
      </div>
    </div>
  )
}
