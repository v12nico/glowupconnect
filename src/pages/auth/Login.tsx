import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    // on success AuthContext redirects via session change
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6">
      <div className="flex-1 flex flex-col justify-center space-y-10 pt-16">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold glow-text">GlowUp.</h1>
          <p className="text-muted-foreground">sign in to your account.</p>
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
            placeholder="password"
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
          {loading ? 'Signing in…' : 'Sign in'}
        </motion.button>
        <p className="text-center text-sm text-muted-foreground">
          no account?{' '}
          <Link to="/signup" className="text-primary font-bold">Create one</Link>
        </p>
      </div>
    </div>
  )
}
