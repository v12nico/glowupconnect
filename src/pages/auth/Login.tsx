import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    navigate('/feed')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <h1 className="font-display text-3xl glow-text">GlowUp</h1>
          <p className="text-muted-foreground text-sm">sign in to your account</p>
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
              value={password}
              onChange={e => setPassword(e.target.value)}
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
            {loading ? 'signing in…' : 'sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          no account?{' '}
          <Link to="/signup" className="text-primary hover:underline">create one</Link>
        </p>
      </div>
    </div>
  )
}
