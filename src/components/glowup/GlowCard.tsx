import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { FeedPost } from '@/types/database'
import Comments from './Comments'

interface Props {
  post: FeedPost
  onUpdate: (id: string, patch: Partial<FeedPost>) => void
}

export default function GlowCard({ post, onUpdate }: Props) {
  const { user } = useAuth()
  const { transformation: t, profile, like_count, comment_count, viewer_liked } = post

  const [revealed, setRevealed]         = useState(false)
  const [liked, setLiked]               = useState(viewer_liked)
  const [likes, setLikes]               = useState(like_count)
  const [comments, setComments]         = useState(comment_count)
  const [showComments, setShowComments] = useState(false)
  const [liking, setLiking]             = useState(false)
  const [beforeLoaded, setBeforeLoaded] = useState(false)
  const [afterLoaded, setAfterLoaded]   = useState(false)

  const beforeUrl = supabase.storage.from('glowups').getPublicUrl(t.before_url).data.publicUrl
  const afterUrl  = supabase.storage.from('glowups').getPublicUrl(t.after_url).data.publicUrl

  async function toggleLike() {
    if (!user || liking) return
    setLiking(true)
    if (liked) {
      await supabase.from('likes').delete()
        .eq('user_id', user.id).eq('transformation_id', t.id)
      setLiked(false)
      setLikes(l => l - 1)
      onUpdate(t.id, { viewer_liked: false, like_count: likes - 1 })
    } else {
      await supabase.from('likes').upsert({
        user_id: user.id, transformation_id: t.id, revealed_first: revealed,
      })
      setLiked(true)
      setLikes(l => l + 1)
      onUpdate(t.id, { viewer_liked: true, like_count: likes + 1 })
    }
    setLiking(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-card rounded-lg overflow-hidden border border-border card-shine">
      {/* image */}
      <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
        {/* skeleton shown until image loads */}
        {!beforeLoaded && <div className="absolute inset-0 skeleton rounded-none" />}

        <img
          src={beforeUrl}
          alt="before"
          onLoad={() => setBeforeLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${beforeLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        <AnimatePresence>
          {revealed && (
            <motion.div
              key="after"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: afterLoaded ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <img
                src={afterUrl}
                alt="after"
                onLoad={() => setAfterLoaded(true)}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-3 left-3 z-10">
          <span className="text-xs font-mono tracking-widest px-2 py-1 rounded-full bg-black/60 text-white/70">
            {revealed ? 'after' : 'before'}
          </span>
        </div>

        {!revealed && (
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
            <motion.button
              onClick={() => setRevealed(true)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-display font-bold text-sm glow-shadow hover:opacity-90 transition-opacity"
            >
              <Eye size={15} />
              reveal the glow-up
            </motion.button>
          </div>
        )}
      </div>

      {/* body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-display font-bold text-primary shrink-0">
            {profile.display_name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-display font-bold leading-none truncate">{profile.display_name}</p>
            <p className="text-xs text-muted-foreground">@{profile.username}</p>
          </div>
          <span className="ml-auto shrink-0 text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
            {t.category.replace('_', ' ')}
          </span>
        </div>

        {t.story && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{t.story}</p>
        )}

        <div className="flex items-center gap-4 pt-1">
          <motion.button
            onClick={toggleLike}
            disabled={liking}
            whileTap={{ scale: liked ? 0.85 : 1.3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            <span>{likes}</span>
          </motion.button>

          <button
            onClick={() => setShowComments(v => !v)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${showComments ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <MessageCircle size={16} />
            <span>{comments}</span>
          </button>
        </div>
      </div>

      <Comments
        transformationId={t.id}
        open={showComments}
        onCountChange={delta => setComments(c => c + delta)}
      />
    </div>
  )
}
