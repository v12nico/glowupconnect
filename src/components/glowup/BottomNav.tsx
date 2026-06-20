import { NavLink } from 'react-router-dom'
import { Home, Heart, MessageSquare, User } from 'lucide-react'

const links = [
  { to: '/feed',    icon: Home,          label: 'home'    },
  { to: '/dating',  icon: Heart,         label: 'dating'  },
  { to: '/matches', icon: MessageSquare, label: 'matches' },
  { to: '/profile', icon: User,          label: 'you'     },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-background/95 backdrop-blur border-t border-border">
      <div className="max-w-sm mx-auto flex">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3.5 text-[10px] tracking-widest font-mono transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
