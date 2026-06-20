import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import BottomNav from '@/components/glowup/BottomNav'

interface MatchRow {
  id:        string
  user_low:  string
  user_high: string
  created_at: string
  other: {
    id:           string
    username:     string
    display_name: string
  }
}

export default function Matches() {
  const navigate            = useNavigate()
  const { user }            = useAuth()
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadMatches() }, [])

  async function loadMatches() {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })

    if (!data?.length) { setLoading(false); return }

    const otherIds = data.map(m => m.user_low === user!.id ? m.user_high : m.user_low)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .in('id', otherIds)

    const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
    setMatches(data.map(m => ({
      ...m,
      other: profileMap[m.user_low === user!.id ? m.user_high : m.user_low],
    })))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <h1 className="font-display font-bold text-lg">Matches</h1>
      </header>

      <main className="max-w-sm mx-auto px-4 py-4 pb-28">
        {/* skeletons */}
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-4">
                <div className="w-11 h-11 rounded-full skeleton shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-28 skeleton" />
                  <div className="h-2.5 w-20 skeleton" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* empty state */}
        {!loading && matches.length === 0 && (
          <div className="flex flex-col items-center text-center py-20 space-y-5">
            <p className="font-display text-2xl font-bold">no matches yet.</p>
            <p className="text-sm text-muted-foreground">keep swiping — your people are out there.</p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/dating')}
              className="px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-display font-bold text-sm glow-shadow"
            >
              Go to Dating
            </motion.button>
          </div>
        )}

        <div className="space-y-1">
          {matches.map(m => (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/chat/${m.id}`)}
              className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl hover:bg-secondary transition-colors text-left min-h-[64px]"
            >
              <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center font-display font-bold text-primary shrink-0">
                {m.other?.display_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm">{m.other?.display_name}</p>
                <p className="text-xs text-muted-foreground">@{m.other?.username}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </motion.button>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
