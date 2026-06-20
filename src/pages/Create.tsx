import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, ArrowLeft, ArrowRight, Check, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { GlowCategory } from '@/types/database'

const CATEGORIES: { value: GlowCategory; label: string }[] = [
  { value: 'fitness',       label: 'fitness'       },
  { value: 'weight_loss',   label: 'weight loss'   },
  { value: 'style',         label: 'style'         },
  { value: 'mental_health', label: 'mental health' },
  { value: 'lifestyle',     label: 'lifestyle'     },
]

type Step = 'before' | 'after' | 'details'

function ImagePicker({
  label, sublabel, file, onChange,
}: { label: string; sublabel: string; file: File | null; onChange: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const preview = file ? URL.createObjectURL(file) : null

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="font-display text-2xl font-bold">{label}</h2>
        <p className="text-sm text-muted-foreground">{sublabel}</p>
      </div>

      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors bg-card flex items-center justify-center"
      >
        {preview
          ? <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
          : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Upload size={28} />
              <span className="text-sm">tap to choose photo</span>
            </div>
          )
        }
      </button>

      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { if (e.target.files?.[0]) onChange(e.target.files[0]) }}
      />
    </div>
  )
}

export default function Create() {
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const [step, setStep]           = useState<Step>('before')
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile]   = useState<File | null>(null)
  const [story, setStory]           = useState('')
  const [category, setCategory]     = useState<GlowCategory>('fitness')
  const [isPrimary, setIsPrimary]   = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const steps: Step[] = ['before', 'after', 'details']
  const stepIdx = steps.indexOf(step)

  async function submit() {
    if (!user || !beforeFile || !afterFile) return
    setUploading(true)
    setError(null)

    try {
      const base = `${user.id}/${Date.now()}`

      const bRes = await supabase.storage.from('glowups').upload(`${base}-before`, beforeFile, { upsert: false })
      if (bRes.error) { setError(`storage (before): ${bRes.error.message}`); setUploading(false); return }

      const aRes = await supabase.storage.from('glowups').upload(`${base}-after`, afterFile, { upsert: false })
      if (aRes.error) { setError(`storage (after): ${aRes.error.message}`); setUploading(false); return }

      if (isPrimary) {
        await supabase.from('transformations')
          .update({ is_primary: false })
          .eq('user_id', user.id)
          .eq('is_primary', true)
      }

      const { error: insertErr } = await supabase.from('transformations').insert({
        user_id:    user.id,
        before_url: bRes.data.path,
        after_url:  aRes.data.path,
        story:      story.trim() || null,
        category,
        is_primary: isPrimary,
      })

      if (insertErr) { setError(`db insert: ${insertErr.message}`); setUploading(false); return }
      navigate('/feed')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'upload failed. try again.')
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => stepIdx > 0 ? setStep(steps[stepIdx - 1]) : navigate('/feed')}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display font-bold">new glow-up</h1>

        {/* step dots */}
        <div className="ml-auto flex gap-1.5">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i <= stepIdx ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            {step === 'before' && (
              <div className="space-y-6">
                <ImagePicker
                  label="the before"
                  sublabel="show where you started. be honest."
                  file={beforeFile}
                  onChange={setBeforeFile}
                />
                <button
                  disabled={!beforeFile}
                  onClick={() => setStep('after')}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-DEFAULT font-display font-bold hover:opacity-90 transition-opacity disabled:opacity-40 glow-shadow"
                >
                  next <ArrowRight size={16} />
                </button>
              </div>
            )}

            {step === 'after' && (
              <div className="space-y-6">
                <ImagePicker
                  label="the after"
                  sublabel="show the result. the glow-up."
                  file={afterFile}
                  onChange={setAfterFile}
                />
                <button
                  disabled={!afterFile}
                  onClick={() => setStep('details')}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-DEFAULT font-display font-bold hover:opacity-90 transition-opacity disabled:opacity-40 glow-shadow"
                >
                  next <ArrowRight size={16} />
                </button>
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground tracking-widest uppercase">your story</label>
                  <textarea
                    value={story}
                    onChange={e => setStory(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="what changed. how long it took. what made it real."
                    className="w-full bg-card border border-border rounded-DEFAULT px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-glow transition-colors resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">{story.length}/500</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground tracking-widest uppercase">category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCategory(c.value)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          category === c.value
                            ? 'border-primary text-primary bg-primary/10'
                            : 'border-border text-muted-foreground hover:border-foreground/40'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* primary toggle */}
                <button
                  type="button"
                  onClick={() => setIsPrimary(v => !v)}
                  className={`w-full flex items-center gap-3 p-4 rounded-DEFAULT border transition-all ${
                    isPrimary ? 'border-primary bg-primary/10' : 'border-border bg-card'
                  }`}
                >
                  <Star size={16} className={isPrimary ? 'text-primary fill-primary' : 'text-muted-foreground'} />
                  <div className="text-left">
                    <p className="text-sm font-display font-bold">set as primary</p>
                    <p className="text-xs text-muted-foreground">this is the glow-up shown on your dating profile</p>
                  </div>
                  <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    isPrimary ? 'border-primary bg-primary' : 'border-border'
                  }`}>
                    {isPrimary && <Check size={10} className="text-primary-foreground" />}
                  </div>
                </button>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <button
                  onClick={submit}
                  disabled={uploading}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-DEFAULT font-display font-bold hover:opacity-90 transition-opacity disabled:opacity-50 glow-shadow"
                >
                  {uploading ? 'uploading…' : 'post your glow-up'}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
