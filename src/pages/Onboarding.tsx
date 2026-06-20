import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

type Step = 'name' | 'handle'

export default function Onboarding() {
  const navigate                  = useNavigate()
  const { user, refreshProfile }  = useAuth()
  const [step, setStep]           = useState<Step>('name')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername]   = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)

  async function finish() {
    if (!user) return
    setError(null)
    setLoading(true)
    const { error } = await supabase.from('profiles').insert({
      id:           user.id,
      username:     username.trim().toLowerCase(),
      display_name: displayName.trim(),
    })
    if (error) {
      setError(error.message.includes('unique') ? 'that handle is taken — try another.' : error.message)
      setLoading(false)
      return
    }
    await refreshProfile()
    navigate('/feed')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6">
      <AnimatePresence mode="wait">
        {step === 'name' && (
          <motion.div
            key="name"
            className="flex flex-col flex-1"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex-1 flex flex-col justify-center space-y-8 pt-16">
              <div className="space-y-2">
                <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">step 1 of 2</p>
                <h1 className="font-display text-3xl font-bold">What's your name?</h1>
              </div>
              <input
                type="text"
                autoFocus
                required
                maxLength={50}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && displayName.trim()) setStep('handle') }}
                placeholder="Your name"
                className="w-full bg-card border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-lg"
              />
            </div>
            <div className="pb-10">
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!displayName.trim()}
                onClick={() => setStep('handle')}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-display font-bold text-base glow-shadow disabled:opacity-40 transition-opacity"
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'handle' && (
          <motion.div
            key="handle"
            className="flex flex-col flex-1"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex-1 flex flex-col justify-center space-y-8 pt-16">
              <div className="space-y-2">
                <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">step 2 of 2</p>
                <h1 className="font-display text-3xl font-bold">Pick a handle.</h1>
                <p className="text-muted-foreground text-sm">letters, numbers, underscores only.</p>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">@</span>
                <input
                  type="text"
                  autoFocus
                  required
                  maxLength={30}
                  pattern="[a-zA-Z0-9_]+"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  onKeyDown={e => { if (e.key === 'Enter' && username.trim()) finish() }}
                  placeholder="yourhandle"
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-lg"
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
            <div className="pb-10 space-y-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!username.trim() || loading}
                onClick={finish}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-display font-bold text-base glow-shadow disabled:opacity-40 transition-opacity"
              >
                {loading ? 'Setting up…' : "Let's go"}
              </motion.button>
              <button
                onClick={() => { setStep('name'); setError(null) }}
                className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
