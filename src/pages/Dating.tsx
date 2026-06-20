import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import SwipeCard, { type Candidate } from '@/components/glowup/SwipeCard'
import BottomNav from '@/components/glowup/BottomNav'

export default function Dating() {
  const navigate           = useNavigate()
  const { user, profile }  = useAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => { loadCandidates() }, [])

  async function loadCandidates() {
    setLoading(true)

    const { data: swiped } = await supabase
      .from('swipes')
      .select('swipee_id')
      .eq('swiper_id', user!.id)
    const swipedIds = swiped?.map(s => s.swipee_id) ?? []

    let query = supabase
      .from('transformations')
      .select('*, profiles!user_id(*)')
      .eq('is_primary', true)
      .neq('user_id', user!.id)

    if (swipedIds.length > 0) query = query.not('user_id', 'in', `(${swipedIds.join(',')})`)

    const { data } = await query.limit(30)

    const myGender     = profile?.gender ?? 'unspecified'
    const interestedIn = profile?.interested_in ?? []

    const list = (data ?? [])
      .filter(t => {
        const p = t.profiles
        if (!p?.in_dating) return false
        const theyWantMe = !p.interested_in?.length || p.interested_in.includes(myGender)
        const iWantThem  = !interestedIn.length || interestedIn.includes(p.gender)
        return theyWantMe && iWantThem
      })
      .map(t => ({ transformation: t, profile: t.profiles }))

    setCandidates(list)
    setLoading(false)
  }

  async function handleSwipe(direction: 'like' | 'pass', revealedFirst: boolean) {
    if (!candidates.length) return
    const top = candidates[0]
    setCandidates(prev => prev.slice(1))
    await supabase.from('swipes').insert({
      swiper_id:      user!.id,
      swipee_id:      top.profile.id,
      direction,
      revealed_first: revealedFirst,
    })
  }

  if (!profile?.in_dating) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
          <h1 className="font-display font-bold text-lg">Dating</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-5 pb-24">
          <p className="font-display text-2xl font-bold">you're not in dating mode.</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            turn it on in your profile. you'll need a primary glow-up too.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/edit-profile')}
            className="flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-display font-bold text-sm glow-shadow"
          >
            <Settings size={14} /> Edit profile
          </motion.button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4 flex items-center justify-between">
        <h1 className="font-display font-bold text-lg">Dating</h1>
        <button
          onClick={() => navigate('/edit-profile')}
          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings size={18} />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-28">
        {loading && (
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        )}

        {!loading && candidates.length === 0 && (
          <div className="flex flex-col items-center text-center space-y-4">
            <p className="font-display text-2xl font-bold">you've seen everyone.</p>
            <p className="text-sm text-muted-foreground">check back as more people join.</p>
          </div>
        )}

        {!loading && candidates.length > 0 && (
          <div className="relative w-full max-w-sm" style={{ height: '580px' }}>
            <AnimatePresence>
              {candidates.slice(0, 3).map((c, i) => (
                <SwipeCard
                  key={c.profile.id}
                  candidate={c}
                  isTop={i === 0}
                  stackIndex={i}
                  onSwipe={i === 0 ? handleSwipe : () => {}}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
