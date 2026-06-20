import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import BottomNav from '@/components/glowup/BottomNav'
import { LogOut, Settings } from 'lucide-react'

export default function Profile() {
  const navigate          = useNavigate()
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-display font-bold">you</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/edit-profile')} className="text-muted-foreground hover:text-foreground transition-colors">
            <Settings size={16} />
          </button>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 py-8 pb-24 space-y-4">
        {profile && (
          <>
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl font-display font-bold text-primary">
              {profile.display_name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-display text-xl font-bold">{profile.display_name}</p>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            </div>
            {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
          </>
        )}
        <p className="text-xs text-muted-foreground pt-4">more profile features coming soon.</p>
      </main>
      <BottomNav />
    </div>
  )
}
