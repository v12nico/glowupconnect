import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { FeedPost } from '@/types/database'
import GlowCard from '@/components/glowup/GlowCard'
import GlowCardSkeleton from '@/components/glowup/GlowCardSkeleton'
import BottomNav from '@/components/glowup/BottomNav'

type Tab = 'new' | 'trending'
const PAGE = 20

export default function Feed() {
  const navigate            = useNavigate()
  const { user }            = useAuth()
  const [tab, setTab]       = useState<Tab>('new')
  const [posts, setPosts]   = useState<FeedPost[]>([])
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const pageRef     = useRef(0)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadPage = useCallback(async (reset: boolean, currentTab: Tab) => {
    if (!user) return
    if (reset) { setLoading(true); setError(null) } else { setLoadingMore(true) }

    const offset = reset ? 0 : pageRef.current * PAGE

    const { data: transformations, error: tErr } = await supabase
      .from('transformations')
      .select('*, profiles!user_id(*)')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE - 1)

    if (tErr) {
      setError(tErr.message)
      reset ? setLoading(false) : setLoadingMore(false)
      return
    }

    if (!transformations?.length) {
      setHasMore(false)
      if (reset) { setPosts([]); setLoading(false) } else setLoadingMore(false)
      return
    }

    const ids = transformations.map(t => t.id)

    const [{ data: likeCounts }, { data: commentCounts }, { data: myLikes }] = await Promise.all([
      supabase.from('likes').select('transformation_id').in('transformation_id', ids),
      supabase.from('comments').select('transformation_id').in('transformation_id', ids),
      supabase.from('likes').select('transformation_id, revealed_first').eq('user_id', user.id).in('transformation_id', ids),
    ])

    const likeMap: Record<string, number>    = {}
    const commentMap: Record<string, number> = {}
    const myLikeSet: Set<string>             = new Set()
    const myRevealSet: Set<string>           = new Set()

    likeCounts?.forEach(l => { likeMap[l.transformation_id] = (likeMap[l.transformation_id] ?? 0) + 1 })
    commentCounts?.forEach(c => { commentMap[c.transformation_id] = (commentMap[c.transformation_id] ?? 0) + 1 })
    myLikes?.forEach(l => { myLikeSet.add(l.transformation_id); if (l.revealed_first) myRevealSet.add(l.transformation_id) })

    let batch: FeedPost[] = transformations.map(t => ({
      transformation:  t,
      profile:         t.profiles,
      like_count:      likeMap[t.id]    ?? 0,
      comment_count:   commentMap[t.id] ?? 0,
      viewer_liked:    myLikeSet.has(t.id),
      viewer_revealed: myRevealSet.has(t.id),
    }))

    if (currentTab === 'trending') batch = batch.sort((a, b) => b.like_count - a.like_count)

    setHasMore(transformations.length === PAGE)
    if (reset) { pageRef.current = 1; setPosts(batch); setLoading(false) }
    else        { pageRef.current += 1; setPosts(prev => [...prev, ...batch]); setLoadingMore(false) }
  }, [user])

  useEffect(() => { pageRef.current = 0; setHasMore(true); loadPage(true, tab) }, [tab, loadPage])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) loadPage(false, tab)
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, loading, loadPage, tab])

  function handleUpdate(id: string, patch: Partial<FeedPost>) {
    setPosts(prev => prev.map(p => p.transformation.id === id ? { ...p, ...patch } : p))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-sm mx-auto px-4 pt-4 pb-0 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold glow-text">GlowUp</h1>
        </div>
        <div className="max-w-sm mx-auto flex mt-1">
          {(['new', 'trending'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-mono tracking-widest transition-colors border-b-2 ${
                tab === t ? 'text-primary border-primary' : 'text-muted-foreground border-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 pt-5 pb-28 space-y-5">
        {/* skeletons */}
        {loading && Array.from({ length: 3 }).map((_, i) => <GlowCardSkeleton key={i} />)}

        {/* error */}
        {error && (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground text-sm">something went wrong.</p>
            <button
              onClick={() => loadPage(true, tab)}
              className="px-5 py-3 bg-primary text-primary-foreground rounded-full font-display font-bold text-sm glow-shadow"
            >
              Try again
            </button>
          </div>
        )}

        {/* empty state */}
        {!loading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center text-center py-20 space-y-5">
            <p className="font-display text-2xl font-bold">nothing here yet.</p>
            <p className="text-sm text-muted-foreground">be the first to share a glow-up.</p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/create')}
              className="px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-display font-bold text-sm glow-shadow"
            >
              Share yours
            </motion.button>
          </div>
        )}

        {posts.map(post => (
          <GlowCard key={post.transformation.id} post={post} onUpdate={handleUpdate} />
        ))}

        <div ref={sentinelRef} className="h-1" />

        {loadingMore && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </main>

      {/* create FAB */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate('/create')}
        className="fixed bottom-20 right-5 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-shadow-lg shadow-lg"
        aria-label="Post a glow-up"
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      <BottomNav />
    </div>
  )
}
