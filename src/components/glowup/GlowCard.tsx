import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { FeedPost } from '@/types/database'
import Comments from './Comments'
import ReportModal from './ReportModal'

interface Props {
  post:     FeedPost
  onUpdate: (id: string, patch: Partial<FeedPost>) => void
}

export default function GlowCard({ post, onUpdate }: Props) {
  const { user } = useAuth()
  const { transformation: t, profile, like_count, comment_count, viewer_liked } = post

  const [revealed, setRevealed]         = useState(false)
  const [glowPulse, setGlowPulse]       = useState(false)
  const [liked, setLiked]               = useState(viewer_liked)
  const [likes, setLikes]               = useState(like_count)
  const [comments, setComments]         = useState(comment_count)
  const [showComments, setShowComments] = useState(false)
  const [liking, setLiking]             = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [reportOpen, setReportOpen]     = useState(false)
  const [beforeLoaded, setBeforeLoaded] = useState(false)

  const beforeUrl = supabase.storage.from('glowups').getPublicUrl(t.before_url).data.publicUrl
  const afterUrl  = supabase.storage.from('glowups').getPublicUrl(t.after_url).data.publicUrl

  function handleReveal() {
    setRevealed(true)
    setGlowPulse(true)
  }

  async function toggleLike() {
    if (!user || liking) return
    setLiking(true)
    if (liked) {
      setLiked(false); setLikes(l => l - 1)
      onUpdate(t.id, { viewer_liked: false, like_count: likes - 1 })
      await supabase.from('likes').delete().eq('user_id', user.id).eq('transformation_id', t.id)
    } else {
      setLiked(true); setLikes(l => l + 1)
      onUpdate(t.id, { viewer_liked: true, like_count: likes + 1 })
      await supabase.from('likes').upsert({ user_id: user.id, transformation_id: t.id, revealed_first: revealed })
    }
    setLiking(false)
  }

  async function blockUser() {
    if (!user) return
    await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: profile.id })
    setMenuOpen(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-card rounded-2xl overflow-hidden border border-border card-shine">

      {/* ── image ── */}
      <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
        {!beforeLoaded && <div className="absolute inset-0 skeleton rounded-none" />}

        <img
          src={beforeUrl}
          alt="before"
          onLoad={() => setBeforeLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${beforeLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* after — clip-path wipe from bottom */}
        <AnimatePresence>
          {revealed && (
            <motion.img
              key="after"
              src={afterUrl}
              alt="after"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)' }}
              transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
            />
          )}
        </AnimatePresence>

        {/* glow pulse after reveal */}
        <AnimatePresence>
          {glowPulse && (
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-none"
              style={{ boxShadow: 'inset 0 0 80px hsl(31 69% 55% / 0.55)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, times: [0, 0.25, 1] }}
              onAnimationComplete={() => setGlowPulse(false)}
            />
          )}
        </AnimatePresence>

        {/* before/after pill */}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[11px] font-mono tracking-widest px-2.5 py-1 rounded-full bg-black/70 text-white/60">
            {revealed ? 'after' : 'before'}
          </span>
        </div>

        {/* reveal button — the hero CTA */}
        {!revealed && (
          <div className="absolute inset-x-0 bottom-0 z-10 pb-5 flex justify-center bg-gradient-to-t from-black/85 via-black/30 to-transparent pt-12">
            <motion.button
              onClick={handleReveal}
              whileTap={{ scale: 0.94 }}
              className="flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-display font-bold text-sm glow-shadow-lg hover:opacity-95 transition-opacity"
            >
              Reveal
            </motion.button>
          </div>
        )}
      </div>

      {/* ── body ── */}
      <div className="px-4 pt-3.5 pb-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-display font-bold text-primary shrink-0">
            {profile.display_name[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-display font-bold leading-none truncate">{profile.display_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">@{profile.username}</p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize shrink-0">
            {t.category.replace('_', ' ')}
          </span>

          {/* 3-dot */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-9 z-20 bg-card border border-border rounded-xl overflow-hidden min-w-[148px] shadow-xl"
                  >
                    <button
                      onClick={() => { setMenuOpen(false); setReportOpen(true) }}
                      className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      Report post
                    </button>
                    <button
                      onClick={blockUser}
                      className="w-full text-left px-4 py-3 text-sm text-destructive hover:bg-secondary transition-colors border-t border-border"
                    >
                      Block user
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {t.story && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{t.story}</p>
        )}

        <div className="flex items-center gap-5 pt-0.5">
          <motion.button
            onClick={toggleLike}
            disabled={liking}
            whileTap={{ scale: liked ? 0.8 : 1.35 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className={`flex items-center gap-1.5 text-sm min-h-[44px] pr-2 transition-colors ${liked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.75} />
            <span>{likes}</span>
          </motion.button>

          <button
            onClick={() => setShowComments(v => !v)}
            className={`flex items-center gap-1.5 text-sm min-h-[44px] pr-2 transition-colors ${showComments ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <MessageCircle size={18} strokeWidth={1.75} />
            <span>{comments}</span>
          </button>
        </div>
      </div>

      <Comments
        transformationId={t.id}
        open={showComments}
        onCountChange={delta => setComments(c => c + delta)}
      />

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetPost={t.id}
        targetUser={profile.id}
      />
    </div>
  )
}
