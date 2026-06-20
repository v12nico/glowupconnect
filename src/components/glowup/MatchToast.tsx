import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface Toast {
  matchId:     string
  displayName: string
}

export default function MatchToast() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('match-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches' },
        async payload => {
          const row = payload.new as { id: string; user_low: string; user_high: string }
          if (row.user_low !== user.id && row.user_high !== user.id) return

          const otherId = row.user_low === user.id ? row.user_high : row.user_low
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', otherId)
            .single()

          const toast: Toast = { matchId: row.id, displayName: profile?.display_name ?? 'someone' }
          setToasts(prev => [...prev, toast])
          setTimeout(() => setToasts(prev => prev.filter(t => t.matchId !== toast.matchId)), 5000)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  return (
    <div className="fixed top-16 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.button
            key={t.matchId}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,   scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={() => navigate(`/chat/${t.matchId}`)}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-card border border-primary/40 rounded-2xl glow-shadow max-w-sm w-full text-left"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Zap size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-display font-bold glow-text">it's a match!</p>
              <p className="text-xs text-muted-foreground">you and {t.displayName} glowed each other. tap to chat.</p>
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
