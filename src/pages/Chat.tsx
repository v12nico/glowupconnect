import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, ShieldOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Message } from '@/types/database'

interface OtherUser {
  id:           string
  username:     string
  display_name: string
}

export default function Chat() {
  const { matchId }    = useParams<{ matchId: string }>()
  const navigate       = useNavigate()
  const { user }       = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [other, setOther]       = useState<OtherUser | null>(null)
  const [body, setBody]         = useState('')
  const [sending, setSending]   = useState(false)
  const [blocked, setBlocked]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!matchId || !user) return
    loadChat()

    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        payload => setMessages(prev => [...prev, payload.new as Message])
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [matchId, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadChat() {
    const { data: match } = await supabase
      .from('matches').select('user_low, user_high').eq('id', matchId).single()
    if (!match) return

    const otherId = match.user_low === user!.id ? match.user_high : match.user_low

    const [{ data: profile }, { data: msgs }] = await Promise.all([
      supabase.from('profiles').select('id, username, display_name').eq('id', otherId).single(),
      supabase.from('messages').select('*').eq('match_id', matchId).order('created_at', { ascending: true }),
    ])

    if (profile) setOther(profile)
    if (msgs)    setMessages(msgs)
    setLoading(false)
  }

  async function block() {
    if (!other || !user) return
    await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: other.id })
    setBlocked(true)
    setTimeout(() => navigate('/matches'), 1200)
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!text || sending) return
    setSending(true)
    setBody('')
    await supabase.from('messages').insert({ match_id: matchId, sender_id: user!.id, body: text })
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/matches')}
          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm leading-tight truncate">{other?.display_name ?? '…'}</p>
          <p className="text-xs text-muted-foreground">@{other?.username}</p>
        </div>
        {blocked
          ? <p className="text-xs text-destructive shrink-0">blocked</p>
          : (
            <button
              onClick={block}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shrink-0"
            >
              <ShieldOff size={18} />
            </button>
          )
        }
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-2 max-w-sm mx-auto w-full">
        {loading && (
          <div className="space-y-3 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`h-9 skeleton rounded-2xl ${i % 2 === 0 ? 'w-40' : 'w-52'}`} />
              </div>
            ))}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-muted-foreground">say something.</p>
          </div>
        )}

        {messages.map(m => {
          const mine = m.sender_id === user!.id
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                mine
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-card border border-border text-foreground rounded-bl-sm'
              }`}>
                {m.body}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </main>

      <form
        onSubmit={send}
        className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border px-4 py-3 flex items-center gap-3 max-w-sm mx-auto w-full"
      >
        <input
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Message…"
          className="flex-1 bg-card border border-border rounded-full px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
        <motion.button
          type="submit"
          disabled={!body.trim() || sending}
          whileTap={{ scale: 0.9 }}
          className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 glow-shadow disabled:opacity-40 transition-opacity"
        >
          <Send size={16} />
        </motion.button>
      </form>
    </div>
  )
}
