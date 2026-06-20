import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { FeedPost } from '@/types/database'
import GlowCard from '@/components/glowup/GlowCard'
import BottomNav from '@/components/glowup/BottomNav'

type Tab = 'new' | 'trending'
const PAGE = 20

export default function Feed() {
  const { user }            = useAuth()
  const [tab, setTab]       = useState<Tab>('new')
  const [posts, setPosts]   = useState<FeedPost[]>([])
  const [loading, setLoading]   = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const pageRef   = useRef(0)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadPage = useCallback(async (reset: boolean, currentTab: Tab) => {
    if (!user) return
    const isFirst = reset
    if (isFirst) { setLoading(true); setError(null) } else { setLoadingMore(true) }

    const offset = isFirst ? 0 : pageRef.current * PAGE

    const query = supabase
      .from('transformations')
      .select('*, profiles!user_id(*)')
      .range(offset, offset + PAGE - 1)

    if (currentTab === 'new') {
      query.order('created_at', { ascending: false })
    } else {
      // trending: order by like count via a subquery isn't easy with PostgREST,
      // so we fetch and sort client-side after enriching
      query.order('created_at', { ascending: false })
    }

    const { data: transformations, error: tErr } = await query

    if (tErr) {
      setError(tErr.message)
      if (isFirst) setLoading(false); else setLoadingMore(false)
      return
    }

    if (!transformations?.length) {
      setHasMore(false)
      if (isFirst) { setPosts([]); setLoading(false) } else { setLoadingMore(false) }
      return
    }

    const ids = transformations.map(t => t.id)

    const [{ data: likeCounts }, { data: commentCounts }, { data: myLikes }] = await Promise.all([
      supabase.from('likes').select('transformation_id').in('transformation_id', ids),
      supabase.from('comments').select('transformation_id').in('transformation_id', ids),
      supabase.from('likes').select('transformation_id, revealed_first').eq('user_id', user.id).in('transformation_id', ids),
    ])

    const likeMap:    Record<string, number> = {}
    const commentMap: Record<string, number> = {}
    const myLikeSet:  Set<string>            = new Set()
    const myRevealSet: Set<string>           = new Set()

    likeCounts?.forEach(l => { likeMap[l.transformation_id] = (likeMap[l.transformation_id] ?? 0) + 1 })
    commentCounts?.forEach(c => { commentMap[c.transformation_id] = (commentMap[c.transformation_id] ?? 0) + 1 })
    myLikes?.forEach(l => {
      myLikeSet.add(l.transformation_id)
      if (l.revealed_first) myRevealSet.add(l.transformation_id)
    })

    let batch: FeedPost[] = transformations.map(t => ({
      transformation:  t,
      profile:         t.profiles,
      like_count:      likeMap[t.id]    ?? 0,
      comment_count:   commentMap[t.id] ?? 0,
      viewer_liked:    myLikeSet.has(t.id),
      viewer_revealed: myRevealSet.has(t.id),
    }))

    if (currentTab === 'trending') {
      batch = batch.sort((a, b) => b.like_count - a.like_count)
    }

    setHasMore(transformations.length === PAGE)
    if (isFirst) {
      pageRef.current = 1
      setPosts(batch)
      setLoading(false)
    } else {
      pageRef.current += 1
      setPosts(prev => [...prev, ...batch])
      setLoadingMore(false)
    }
  }, [user])

  // reset on tab change
  useEffect(() => {
    pageRef.current = 0
    setHasMore(true)
    loadPage(true, tab)
  }, [tab, loadPage])

  // IntersectionObserver sentinel
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
        loadPage(false, tab)
      }
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, loading, loadPage, tab])

  function handleUpdate(id: string, patch: Partial<FeedPost>) {
    setPosts(prev => prev.map(p => p.transformation.id === id ? { ...p, ...patch } : p))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold glow-text">GlowUp</h1>
        </div>
        <div className="flex border-b border-border max-w-sm mx-auto">
          {(['new', 'trending'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-mono tracking-widest transition-colors ${
                tab === t
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 pt-6 pb-24 space-y-6">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 space-y-2">
            <p className="text-destructive text-sm">{error}</p>
            <button onClick={() => loadPage(true, tab)} className="text-xs text-muted-foreground hover:text-foreground underline">retry</button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16 space-y-2">
            <p className="font-display text-lg">no glow-ups yet.</p>
            <p className="text-sm text-muted-foreground">be the first to share your transformation.</p>
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
      <BottomNav />
    </div>
  )
}
