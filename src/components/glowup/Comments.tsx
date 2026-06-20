import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { CommentWithProfile } from '@/types/database'

interface Props {
  transformationId: string
  open: boolean
  onCountChange: (delta: number) => void
}

export default function Comments({ transformationId, open, onCountChange }: Props) {
  const { user } = useAuth()
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [body, setBody]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [posting, setPosting]   = useState(false)
  const inputRef                = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && comments.length === 0) fetchComments()
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  async function fetchComments() {
    setLoading(true)
    const { data } = await supabase
      .from('comments')
      .select('*, profiles!user_id(username, display_name)')
      .eq('transformation_id', transformationId)
      .order('created_at', { ascending: true })
      .limit(50)
    setComments((data as CommentWithProfile[]) ?? [])
    setLoading(false)
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !body.trim() || posting) return
    setPosting(true)
    const trimmed = body.trim()
    setBody('')

    const { data, error } = await supabase
      .from('comments')
      .insert({ transformation_id: transformationId, user_id: user.id, body: trimmed })
      .select('*, profiles!user_id(username, display_name)')
      .single()

    if (!error && data) {
      setComments(prev => [...prev, data as CommentWithProfile])
      onCountChange(1)
    }
    setPosting(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden border-t border-border"
        >
          <div className="px-4 py-3 space-y-3">
            {loading && (
              <p className="text-xs text-muted-foreground text-center py-2">loading…</p>
            )}

            {!loading && comments.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">no comments yet. be first.</p>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <span className="text-xs font-display font-bold text-primary shrink-0">
                    {c.profiles.display_name}
                  </span>
                  <span className="text-xs text-foreground leading-relaxed">{c.body}</span>
                </div>
              ))}
            </div>

            <form onSubmit={postComment} className="flex gap-2 pt-1">
              <input
                ref={inputRef}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="add a comment…"
                maxLength={280}
                className="flex-1 bg-secondary border border-border rounded-full px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-glow transition-colors"
              />
              <button
                type="submit"
                disabled={!body.trim() || posting}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
