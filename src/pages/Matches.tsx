import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import BottomNav from '@/components/glowup/BottomNav'

interface MatchRow {
  id:         string
  user_low:   string
  user_high:  string
  created_at: string
  other: {
    id:           string
    username:     string
    display_name: string
  }
}

export default function Matches() {
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const [matches, setMatches]   = useState<MatchRow[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { loadMatches() }, [])

  async function loadMatches() {
    // RLS ensures we only see our own matches
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })

    if (!data?.length) { setLoading(false); return }

    const otherIds = data.map(m =>
      m.user_low === user!.id ? m.user_high : m.user_low
    )

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .in('id', otherIds)

    const profileMap = Object.fromEntries(
      (profiles ?? []).map(p => [p.id, p])
    )

    setMatches(
      data.map(m => ({
        ...m,
        other: profileMap[m.user_low === user!.id ? m.user_high : m.user_low],
      }))
    )
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-4 py-3">
        <h1 className="font-display font-bold glow-text">matches</h1>
      </header>

      <main className="max-w-sm mx-auto px-4 py-4 pb-24">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && matches.length === 0 && (
          <div className="text-center py-16 space-y-2">
            <p className="font-display text-lg">no matches yet.</p>
            <p className="text-sm text-muted-foreground">keep swiping in dating mode.</p>
          </div>
        )}

        <div className="space-y-1">
          {matches.map(m => (
            <button
              key={m.id}
              onClick={() => navigate(`/chat/${m.id}`)}
              className="w-full flex items-center gap-3 px-3 py-4 rounded-DEFAULT hover:bg-secondary transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary shrink-0">
                {m.other?.display_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm">{m.other?.display_name}</p>
                <p className="text-xs text-muted-foreground">@{m.other?.username}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
