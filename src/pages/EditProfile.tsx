import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { UserGender } from '@/types/database'

const GENDERS: { value: UserGender; label: string }[] = [
  { value: 'man',         label: 'Man'              },
  { value: 'woman',       label: 'Woman'            },
  { value: 'nonbinary',   label: 'Nonbinary'        },
  { value: 'unspecified', label: 'Prefer not to say'},
]

export default function EditProfile() {
  const navigate              = useNavigate()
  const { profile, refreshProfile } = useAuth()

  const [bio, setBio]             = useState(profile?.bio ?? '')
  const [gender, setGender]       = useState<UserGender>(profile?.gender ?? 'unspecified')
  const [birthdate, setBirthdate] = useState(profile?.birthdate ?? '')
  const [location, setLocation]   = useState(profile?.location ?? '')
  const [inDating, setInDating]   = useState(profile?.in_dating ?? false)
  const [interestedIn, setInterestedIn] = useState<UserGender[]>(profile?.interested_in ?? [])
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  function toggleInterest(g: UserGender) {
    setInterestedIn(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  async function save() {
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

  const inputClass = "w-full bg-card border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-base"
  const pillClass  = (active: boolean) => `px-4 py-2.5 rounded-full text-sm border transition-all min-h-[44px] ${active ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-foreground/30'}`

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-bold text-lg">Edit profile</h1>
      </header>

      <div className="flex-1 max-w-sm mx-auto w-full px-4 py-6 space-y-7">
        {/* bio */}
        <div className="space-y-2">
          <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            placeholder="tell your story in a sentence."
            className={`${inputClass} resize-none`}
          />
          <p className="text-xs text-muted-foreground text-right">{bio.length}/160</p>
        </div>

        {/* location */}
        <div className="space-y-2">
          <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase">Location</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="City, State"
            className={inputClass}
          />
        </div>

        {/* birthdate */}
        <div className="space-y-2">
          <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase">Birthday</label>
          <input
            type="date"
            value={birthdate}
            onChange={e => setBirthdate(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* gender */}
        <div className="space-y-3">
          <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase">I am</label>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map(g => (
              <button key={g.value} type="button" onClick={() => setGender(g.value)} className={pillClass(gender === g.value)}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* dating mode */}
        <div className="space-y-5 pt-2 border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display font-bold text-sm">Dating mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">show your glow-up in the swipe deck</p>
            </div>
            <button
              type="button"
              onClick={() => setInDating(v => !v)}
              className={`shrink-0 w-12 h-6 rounded-full border transition-all relative ${inDating ? 'bg-primary/20 border-primary/60' : 'bg-secondary border-border'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${inDating ? 'left-6 bg-primary' : 'left-0.5 bg-muted-foreground'}`} />
            </button>
          </div>

          {inDating && (
            <div className="space-y-3">
              <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase">Interested in</label>
              <div className="flex flex-wrap gap-2">
                {GENDERS.filter(g => g.value !== 'unspecified').map(g => (
                  <button key={g.value} type="button" onClick={() => toggleInterest(g.value)} className={pillClass(interestedIn.includes(g.value))}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>

      <div className="sticky bottom-0 px-4 pb-8 pt-3 bg-background/95 backdrop-blur border-t border-border max-w-sm mx-auto w-full">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-display font-bold text-base glow-shadow disabled:opacity-50 transition-opacity"
        >
          {saving ? 'Saving…' : 'Save'}
        </motion.button>
      </div>
    </div>
  )
}
