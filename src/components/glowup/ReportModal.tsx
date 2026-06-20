import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

const REASONS = [
  'inappropriate content',
  'fake transformation',
  'spam',
  'harassment',
]

interface Props {
  open:           boolean
  onClose:        () => void
  targetPost?:    string
  targetUser?:    string
}

export default function ReportModal({ open, onClose, targetPost, targetUser }: Props) {
  const { user }    = useAuth()
  const [reason, setReason] = useState('')
  const [done, setDone]     = useState(false)
  const [sending, setSending] = useState(false)

  async function submit() {
    if (!reason || !user) return
    setSending(true)
    await supabase.from('reports').insert({
      reporter_id: user.id,
      target_post: targetPost ?? null,
      target_user: targetUser ?? null,
      reason,
    })
    setSending(false)
    setDone(true)
    setTimeout(() => { setDone(false); setReason(''); onClose() }, 1500)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 bottom-8 z-50 max-w-sm mx-auto bg-card border border-border rounded-2xl p-5 space-y-4"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <div className="flex items-center justify-between">
              <p className="font-display font-bold">report</p>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={16} />
              </button>
            </div>

            {done ? (
              <p className="text-sm text-primary font-display font-bold py-4 text-center">reported. thank you.</p>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {REASONS.map(r => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`text-left px-4 py-2.5 rounded-DEFAULT border text-sm transition-all ${
                        reason === r
                          ? 'border-primary text-primary bg-primary/10'
                          : 'border-border text-muted-foreground hover:border-foreground/30'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <button
                  onClick={submit}
                  disabled={!reason || sending}
                  className="w-full bg-destructive text-destructive-foreground py-2.5 rounded-DEFAULT font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {sending ? 'sending…' : 'submit report'}
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
