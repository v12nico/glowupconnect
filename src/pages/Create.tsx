import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, ArrowLeft, Star, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { GlowCategory } from '@/types/database'

const CATEGORIES: { value: GlowCategory; label: string }[] = [
  { value: 'fitness',       label: 'Fitness'       },
  { value: 'weight_loss',   label: 'Weight loss'   },
  { value: 'style',         label: 'Style'         },
  { value: 'mental_health', label: 'Mental health' },
  { value: 'lifestyle',     label: 'Lifestyle'     },
]

type Step = 'before' | 'after' | 'details'

function ImagePicker({
  label, sublabel, file, onChange,
}: { label: string; sublabel: string; file: File | null; onChange: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const preview = file ? URL.createObjectURL(file) : null

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-bold">{label}</h2>
        <p className="text-sm text-muted-foreground">{sublabel}</p>
      </div>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors bg-card flex items-center justify-center"
      >
        {preview
          ? <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
          : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Upload size={28} />
              <span className="text-sm">Tap to choose photo</span>
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
  const navigate    = useNavigate()
  const { user }    = useAuth()
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
      if (bRes.error) { setError(`Upload failed: ${bRes.error.message}`); setUploading(false); return }

      const aRes = await supabase.storage.from('glowups').upload(`${base}-after`, afterFile, { upsert: false })
      if (aRes.error) { setError(`Upload failed: ${aRes.error.message}`); setUploading(false); return }

      if (isPrimary) {
        await supabase.from('transformations').update({ is_primary: false }).eq('user_id', user.id).eq('is_primary', true)
      }

      const { error: insertErr } = await supabase.from('transformations').insert({
        user_id:    user.id,
        before_url: bRes.data.path,
        after_url:  aRes.data.path,
        story:      story.trim() || null,
        category,
        is_primary: isPrimary,
      })

      if (insertErr) { setError(insertErr.message); setUploading(false); return }
      navigate('/feed')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed. Try again.')
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => stepIdx > 0 ? setStep(steps[stepIdx - 1]) : navigate('/feed')}
          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-bold text-lg">New glow-up</h1>
        <div className="ml-auto flex gap-1.5">
          {steps.map((s, i) => (
            <div key={s} className={`w-2 h-2 rounded-full transition-colors ${i <= stepIdx ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>
      </header>

      <div className="flex-1 max-w-sm mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="flex flex-col min-h-full"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            {/* before */}
            {step === 'before' && (
              <div className="flex flex-col flex-1 px-4 pt-6 pb-0">
                <div className="flex-1">
                  <ImagePicker label="The before" sublabel="Show where you started. Be honest." file={beforeFile} onChange={setBeforeFile} />
                </div>
                <div className="py-6">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={!beforeFile}
                    onClick={() => setStep('after')}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-display font-bold text-base glow-shadow disabled:opacity-40 transition-opacity"
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            )}

            {/* after */}
            {step === 'after' && (
              <div className="flex flex-col flex-1 px-4 pt-6 pb-0">
                <div className="flex-1">
                  <ImagePicker label="The after" sublabel="Show the result. The glow-up." file={afterFile} onChange={setAfterFile} />
                </div>
                <div className="py-6">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={!afterFile}
                    onClick={() => setStep('details')}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-display font-bold text-base glow-shadow disabled:opacity-40 transition-opacity"
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            )}

            {/* details */}
            {step === 'details' && (
              <div className="flex flex-col flex-1 px-4 pt-6">
                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase">Your story</label>
                    <textarea
                      value={story}
                      onChange={e => setStory(e.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="What changed. How long it took. What made it real."
                      className="w-full bg-card border border-border rounded-xl px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">{story.length}/500</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(c => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setCategory(c.value)}
                          className={`px-4 py-2.5 rounded-full text-sm border transition-all min-h-[44px] ${
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

                  <button
                    type="button"
                    onClick={() => setIsPrimary(v => !v)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                      isPrimary ? 'border-primary bg-primary/10' : 'border-border bg-card'
                    }`}
                  >
                    <Star size={16} className={isPrimary ? 'text-primary fill-primary' : 'text-muted-foreground'} />
                    <div className="text-left">
                      <p className="text-sm font-display font-bold">Set as primary</p>
                      <p className="text-xs text-muted-foreground">shown on your dating profile</p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                      isPrimary ? 'border-primary bg-primary' : 'border-border'
                    }`}>
                      {isPrimary && <Check size={11} className="text-primary-foreground" />}
                    </div>
                  </button>

                  {error && <p className="text-destructive text-sm">{error}</p>}
                </div>

                <div className="py-6">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={submit}
                    disabled={uploading}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-display font-bold text-base glow-shadow disabled:opacity-50 transition-opacity"
                  >
                    {uploading ? 'Posting…' : 'Post'}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
