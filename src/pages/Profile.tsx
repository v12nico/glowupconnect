import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Settings, MapPin, Heart, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Transformation } from '@/types/database'
import BottomNav from '@/components/glowup/BottomNav'

interface Stats {
  glows:   number
  matches: number
}

export default function Profile() {
  const navigate             = useNavigate()
  const { profile, signOut, user } = useAuth()
  const [transformations, setTransformations] = useState<Transformation[]>([])
  const [stats, setStats]    = useState<Stats>({ glows: 0, matches: 0 })
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    if (!user) return
    loadProfile()
  }, [user])

  async function loadProfile() {
    const [{ data: txs }, { data: matches }] = await Promise.all([
      supabase.from('transformations').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('matches').select('id').or(`user_low.eq.${user!.id},user_high.eq.${user!.id}`),
    ])

    const myTxs = txs ?? []
    setTransformations(myTxs)

    // now fetch like count for all my transformations
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
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-display font-bold">you</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/edit-profile')} className="text-muted-foreground hover:text-foreground transition-colors">
            <Settings size={16} />
          </button>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6">
        {profile && (
          <>
            {/* avatar + info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-display font-bold text-primary shrink-0">
                {profile.display_name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-display text-xl font-bold leading-tight">{profile.display_name}</p>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                {profile.location && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
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
              <div className="bg-card border border-border rounded-DEFAULT px-4 py-3 flex items-center gap-3">
                <Heart size={16} className="text-primary shrink-0" />
                <div>
                  <p className="font-display font-bold text-lg leading-none">{loading ? '—' : stats.glows}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">glows received</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-DEFAULT px-4 py-3 flex items-center gap-3">
                <Zap size={16} className="text-primary shrink-0" />
                <div>
                  <p className="font-display font-bold text-lg leading-none">{loading ? '—' : stats.matches}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">matches</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* transformations */}
        <div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3">my glow-ups</p>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && transformations.length === 0 && (
            <div className="text-center py-8 space-y-2 border border-dashed border-border rounded-DEFAULT">
              <p className="text-sm text-muted-foreground">no glow-ups yet.</p>
              <button
                onClick={() => navigate('/create')}
                className="text-xs text-primary hover:opacity-80 transition-opacity"
              >
                post your first one →
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {transformations.map(t => {
              const isRevealed = revealed.has(t.id)
              return (
                <button
                  key={t.id}
                  onClick={() => toggleReveal(t.id)}
                  className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-card group"
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
                </button>
              )
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
