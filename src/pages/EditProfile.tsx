import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { UserGender } from '@/types/database'

const GENDERS: { value: UserGender; label: string }[] = [
  { value: 'man',        label: 'man'       },
  { value: 'woman',      label: 'woman'     },
  { value: 'nonbinary',  label: 'nonbinary' },
  { value: 'unspecified', label: 'prefer not to say' },
]

export default function EditProfile() {
  const navigate          = useNavigate()
  const { profile, refreshProfile } = useAuth()

  const [bio, setBio]               = useState(profile?.bio ?? '')
  const [gender, setGender]         = useState<UserGender>(profile?.gender ?? 'unspecified')
  const [birthdate, setBirthdate]   = useState(profile?.birthdate ?? '')
  const [location, setLocation]     = useState(profile?.location ?? '')
  const [inDating, setInDating]     = useState(profile?.in_dating ?? false)
  const [interestedIn, setInterestedIn] = useState<UserGender[]>(profile?.interested_in ?? [])
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

  function toggleInterest(g: UserGender) {
    setInterestedIn(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    )
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('profiles').update({
      bio:           bio.trim() || null,
      gender,
      birthdate:     birthdate || null,
      location:      location.trim() || null,
      in_dating:     inDating,
      interested_in: interestedIn,
    }).eq('id', profile.id)
    if (error) { setError(error.message); setSaving(false); return }
    await refreshProfile()
    navigate('/profile')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display font-bold">edit profile</h1>
      </header>

      <form onSubmit={save} className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground tracking-widest uppercase">bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            placeholder="tell your story in a sentence."
            className="w-full bg-card border border-border rounded-DEFAULT px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-glow transition-colors resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground tracking-widest uppercase">location</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="city, state"
            className="w-full bg-card border border-border rounded-DEFAULT px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-glow transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground tracking-widest uppercase">birthdate</label>
          <input
            type="date"
            value={birthdate}
            onChange={e => setBirthdate(e.target.value)}
            className="w-full bg-card border border-border rounded-DEFAULT px-4 py-3 text-sm text-foreground focus:outline-none focus:border-glow transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground tracking-widest uppercase">i am</label>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map(g => (
              <button key={g.value} type="button" onClick={() => setGender(g.value)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${gender === g.value ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-foreground/40'}`}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* dating mode */}
        <div className="space-y-4 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-display font-bold">dating mode</p>
              <p className="text-xs text-muted-foreground">show your primary glow-up in the swipe deck</p>
            </div>
            <button type="button" onClick={() => setInDating(v => !v)}
              className={`shrink-0 w-10 h-5 rounded-full border transition-all relative ${inDating ? 'bg-primary/20 border-primary/50' : 'bg-secondary border-border'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${inDating ? 'left-5 bg-primary' : 'left-0.5 bg-muted-foreground'}`} />
            </button>
          </div>

          {inDating && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground tracking-widest uppercase">interested in</label>
              <div className="flex flex-wrap gap-2">
                {GENDERS.filter(g => g.value !== 'unspecified').map(g => (
                  <button key={g.value} type="button" onClick={() => toggleInterest(g.value)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${interestedIn.includes(g.value) ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-foreground/40'}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <button type="submit" disabled={saving}
          className="w-full bg-primary text-primary-foreground py-3 rounded-DEFAULT font-display font-bold hover:opacity-90 transition-opacity disabled:opacity-50 glow-shadow">
          {saving ? 'saving…' : 'save profile'}
        </button>
      </form>
    </div>
  )
}
