import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function Onboarding() {
  const navigate          = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [username, setUsername]         = useState('')
  const [displayName, setDisplayName]   = useState('')
  const [error, setError]               = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setLoading(true)

    const { error } = await supabase.from('profiles').insert({
      id:           user.id,
      username:     username.trim().toLowerCase(),
      display_name: displayName.trim(),
    })

    if (error) {
      setError(error.message.includes('unique') ? 'that username is taken' : error.message)
      setLoading(false)
      return
    }

    await refreshProfile()
    navigate('/feed')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl glow-text">you're in.</h1>
          <p className="text-muted-foreground text-sm">one more step — set your profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground tracking-widest uppercase">username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <input
                type="text"
                required
                maxLength={30}
                pattern="[a-zA-Z0-9_]+"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-card border border-border rounded-DEFAULT pl-8 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-glow transition-colors"
                placeholder="yourhandle"
              />
            </div>
            <p className="text-xs text-muted-foreground">letters, numbers, underscores only</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground tracking-widest uppercase">display name</label>
            <input
              type="text"
              required
              maxLength={50}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-card border border-border rounded-DEFAULT px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-glow transition-colors"
              placeholder="Your Name"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-DEFAULT font-display font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 glow-shadow"
          >
            {loading ? 'saving…' : "let's go →"}
          </button>
        </form>
      </div>
    </div>
  )
}
