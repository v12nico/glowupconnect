import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Settings, MapPin, Heart, Zap, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Transformation } from '@/types/database'
import BottomNav from '@/components/glowup/BottomNav'

interface Stats { glows: number; matches: number }

export default function Profile() {
  const navigate             = useNavigate()
  const { profile, signOut, user } = useAuth()
  const [transformations, setTransformations] = useState<Transformation[]>([])
  const [stats, setStats]    = useState<Stats>({ glows: 0, matches: 0 })
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [loading, setLoading]   = useState(true)

  useEffect(() => { if (user) loadProfile() }, [user])

  async function loadProfile() {
    const [{ data: txs }, { data: matches }] = await Promise.all([
      supabase.from('transformations').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('matches').select('id').or(`user_low.eq.${user!.id},user_high.eq.${user!.id}`),
    ])

    const myTxs = txs ?? []
    setTransformations(myTxs)

    let glowCount = 0
    if (myTxs.length > 0) {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .in('transformation_id', myTxs.map(t => t.id))
      glowCount = count ?? 0
    }

    setStats({ glows: glowCount, matches: matches?.length ?? 0 })
    setLoading(false)
  }

  function getUrl(path: string) {
    return supabase.storage.from('glowups').getPublicUrl(path).data.publicUrl
  }

  function toggleReveal(id: string) {
    setRevealed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4 flex items-center justify-between">
        <h1 className="font-display font-bold text-lg">You</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/edit-profile')}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={signOut}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 py-6 pb-28 space-y-6">
        {profile && (
          <>
            {/* avatar + info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-2xl font-display font-bold text-primary shrink-0">
                {profile.display_name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-display text-xl font-bold leading-tight">{profile.display_name}</p>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                {profile.location && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin size={10} /> {profile.location}
                  </p>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
            )}

            {/* stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-2xl px-4 py-4 flex items-center gap-3">
                <Heart size={16} className="text-primary shrink-0" />
                <div>
                  <p className="font-display font-bold text-xl leading-none">{loading ? '—' : stats.glows}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">glows</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-4 flex items-center gap-3">
                <Zap size={16} className="text-primary shrink-0" />
                <div>
                  <p className="font-display font-bold text-xl leading-none">{loading ? '—' : stats.matches}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">matches</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* glow-ups grid */}
        <div>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">my glow-ups</p>

          {loading && (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] skeleton rounded-2xl" />
              ))}
            </div>
          )}

          {!loading && transformations.length === 0 && (
            <div className="flex flex-col items-center text-center py-12 space-y-4 border border-dashed border-border rounded-2xl">
              <p className="text-sm text-muted-foreground">no glow-ups yet.</p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/create')}
                className="flex items-center gap-1.5 px-5 py-3 bg-primary text-primary-foreground rounded-full font-display font-bold text-sm glow-shadow"
              >
                <Plus size={14} /> Share your first
              </motion.button>
            </div>
          )}

          {!loading && transformations.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {transformations.map(t => {
                const isRevealed = revealed.has(t.id)
                return (
                  <motion.button
                    key={t.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleReveal(t.id)}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border bg-card"
                  >
                    <img
                      src={getUrl(isRevealed ? t.after_url : t.before_url)}
                      alt={isRevealed ? 'after' : 'before'}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    />
                    {t.is_primary && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Zap size={10} className="text-primary-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-[10px] font-mono text-white/60 tracking-widest">
                        {isRevealed ? 'after' : 'before'} · tap
                      </span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
