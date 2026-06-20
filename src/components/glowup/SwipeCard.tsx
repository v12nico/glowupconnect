import { useState } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, type PanInfo } from 'framer-motion'
import { Eye, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Transformation, Profile } from '@/types/database'

export interface Candidate {
  transformation: Transformation
  profile:        Profile
}

interface Props {
  candidate:  Candidate
  isTop:      boolean
  stackIndex: number   // 0 = top, 1 = next, 2 = third
  onSwipe:    (direction: 'like' | 'pass', revealedFirst: boolean) => void
}

const THRESHOLD = 100

export default function SwipeCard({ candidate, isTop, stackIndex, onSwipe }: Props) {
  const { transformation: t, profile } = candidate
  const [revealed, setRevealed] = useState(false)
  const controls = useAnimation()
  const x        = useMotionValue(0)
  const rotate   = useTransform(x, [-220, 220], [-18, 18])
  const likeOp   = useTransform(x, [30, 110], [0, 1])
  const passOp   = useTransform(x, [-110, -30], [1, 0])

  const beforeUrl = supabase.storage.from('glowups').getPublicUrl(t.before_url).data.publicUrl
  const afterUrl  = supabase.storage.from('glowups').getPublicUrl(t.after_url).data.publicUrl

  async function handleDragEnd(_: unknown, info: PanInfo) {
    const gone = Math.abs(info.offset.x) > THRESHOLD || Math.abs(info.velocity.x) > 600
    if (!gone) {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } })
      return
    }
    const dir = info.offset.x > 0 || info.velocity.x > 0 ? 'like' : 'pass'
    await controls.start({
      x:       dir === 'like' ? 800 : -800,
      opacity: 0,
      rotate:  dir === 'like' ? 20 : -20,
      transition: { duration: 0.3 },
    })
    onSwipe(dir, revealed)
  }

  // behind cards — just a scaled peek
  if (!isTop) {
    const scale = 1 - stackIndex * 0.04
    const y     = stackIndex * 10
    return (
      <motion.div
        className="absolute inset-0 rounded-2xl bg-card border border-border overflow-hidden"
        style={{ scale, y, zIndex: 10 - stackIndex }}
        animate={{ scale, y }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      />
    )
  }

  return (
    <motion.div
      className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      animate={controls}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.02 }}
    >
      {/* GLOW stamp */}
      <motion.div style={{ opacity: likeOp }}
        className="absolute top-8 left-5 z-30 rotate-[-12deg] border-4 border-primary text-primary font-display font-black text-2xl px-3 py-1 rounded-lg pointer-events-none">
        GLOW ✦
      </motion.div>

      {/* PASS stamp */}
      <motion.div style={{ opacity: passOp }}
        className="absolute top-8 right-5 z-30 rotate-[12deg] border-4 border-destructive text-destructive font-display font-black text-2xl px-3 py-1 rounded-lg pointer-events-none">
        PASS
      </motion.div>

      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border">
        {/* before */}
        <img src={beforeUrl} alt="before" className="absolute inset-0 w-full h-full object-cover" />

        {/* after */}
        {revealed && (
          <motion.img src={afterUrl} alt="after"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          />
        )}

        {/* label */}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-xs font-mono tracking-widest px-2 py-1 rounded-full bg-black/60 text-white/70">
            {revealed ? 'after' : 'before'}
          </span>
        </div>

        {/* bottom overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <p className="font-display text-xl font-bold text-white">{profile.display_name}</p>
          {profile.location && (
            <p className="flex items-center gap-1 text-sm text-white/60 mt-0.5">
              <MapPin size={12} /> {profile.location}
            </p>
          )}
          {profile.bio && (
            <p className="text-sm text-white/70 mt-1 line-clamp-2">{profile.bio}</p>
          )}
          {!revealed && (
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => setRevealed(true)}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-display font-bold glow-shadow hover:opacity-90 transition-opacity"
            >
              <Eye size={14} /> reveal the glow-up
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
