import { NavLink } from 'react-router-dom'
import { Home, Heart, PlusSquare, MessageSquare, User } from 'lucide-react'

const links = [
  { to: '/feed',    icon: Home,          label: 'feed'    },
  { to: '/dating',  icon: Heart,         label: 'dating'  },
  { to: '/create',  icon: PlusSquare,    label: 'create'  },
  { to: '/matches', icon: MessageSquare, label: 'matches' },
  { to: '/profile', icon: User,          label: 'you'     },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-background/90 backdrop-blur border-t border-border">
      <div className="max-w-sm mx-auto flex">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Icon size={20} />
            <span className="font-mono tracking-widest">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
