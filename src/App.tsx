import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import Onboarding from '@/pages/Onboarding'
import Feed from '@/pages/Feed'
import Create from '@/pages/Create'
import Profile from '@/pages/Profile'
import EditProfile from '@/pages/EditProfile'
import Dating from '@/pages/Dating'
import Matches from '@/pages/Matches'
import Chat from '@/pages/Chat'
import MatchToast from '@/components/glowup/MatchToast'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
  return session ? <>{children}</> : <Navigate to="/login" replace />
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return null
  return profile ? <>{children}</> : <Navigate to="/onboarding" replace />
}

function AppRoutes() {
  const { session, profile } = useAuth()

  return (
    <Routes>
      {/* public */}
      <Route path="/login"  element={session ? <Navigate to="/feed" replace /> : <Login />} />
      <Route path="/signup" element={session ? <Navigate to="/feed" replace /> : <Signup />} />

      {/* auth required, no profile yet */}
      <Route path="/onboarding" element={
        <RequireAuth>
          {profile ? <Navigate to="/feed" replace /> : <Onboarding />}
        </RequireAuth>
      } />

      {/* auth + profile required */}
      <Route path="/feed" element={
        <RequireAuth><RequireProfile><Feed /></RequireProfile></RequireAuth>
      } />
      <Route path="/create" element={
        <RequireAuth><RequireProfile><Create /></RequireProfile></RequireAuth>
      } />
      <Route path="/profile" element={
        <RequireAuth><RequireProfile><Profile /></RequireProfile></RequireAuth>
      } />
      <Route path="/edit-profile" element={
        <RequireAuth><RequireProfile><EditProfile /></RequireProfile></RequireAuth>
      } />
      <Route path="/dating" element={
        <RequireAuth><RequireProfile><Dating /></RequireProfile></RequireAuth>
      } />
      <Route path="/matches" element={
        <RequireAuth><RequireProfile><Matches /></RequireProfile></RequireAuth>
      } />
      <Route path="/chat/:matchId" element={
        <RequireAuth><RequireProfile><Chat /></RequireProfile></RequireAuth>
      } />

      {/* default — session + no profile → onboarding; session + profile → feed */}
      <Route path="/" element={
        session
          ? (profile ? <Navigate to="/feed" replace /> : <Navigate to="/onboarding" replace />)
          : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MatchToast />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
