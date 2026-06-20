export default function GlowCardSkeleton() {
  return (
    <div className="w-full max-w-sm mx-auto bg-card rounded-lg overflow-hidden border border-border">
      <div className="aspect-[3/4] skeleton rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full skeleton shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-24 skeleton" />
            <div className="h-2.5 w-16 skeleton" />
          </div>
          <div className="h-5 w-16 skeleton rounded-full" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 w-full skeleton" />
          <div className="h-2.5 w-3/4 skeleton" />
        </div>
        <div className="flex gap-4 pt-1">
          <div className="h-4 w-10 skeleton" />
          <div className="h-4 w-10 skeleton" />
        </div>
      </div>
    </div>
  )
}
