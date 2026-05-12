import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Home, Plus, ClipboardList, Users,
  MessageSquare, Settings, Menu, X, LogOut, Bell, Video, Send,
  ChevronDown, User as UserIcon, ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ConfirmDialog from '../../components/common/ConfirmDialog'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/properties', label: 'All Properties', icon: Home },
  { to: '/admin/video-listings', label: 'Video Listings', icon: Video, badge: 2 },
  { to: '/admin/add-property', label: 'Add Property', icon: Plus },
  { to: '/admin/pending', label: 'Pending Approvals', icon: ClipboardList, badge: 4 },
  { to: '/admin/testimonials', label: 'Testimonials', icon: Video },
  { to: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare, badge: 7 },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/sms-templates', label: 'SMS Templates', icon: Send },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Close the user dropdown when clicking anywhere outside it. We can't use
  // onBlur + setTimeout — closing the menu on mousedown unmounts the <Link>
  // child before its click event fires, so navigation never happens.
  useEffect(() => {
    if (!userMenuOpen) return
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [userMenuOpen])

  const initials = user
    ? ((user.firstName[0] ?? '') + (user.lastName[0] ?? '')).toUpperCase() || 'A'
    : 'A'

  // First step — close any open menus and surface the confirmation dialog.
  const handleSignOut = () => {
    setUserMenuOpen(false)
    setSidebarOpen(false)
    setConfirmSignOut(true)
  }

  // Second step — only runs once the user actually confirms.
  const performSignOut = async () => {
    setSigningOut(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setSigningOut(false)
      setConfirmSignOut(false)
    }
  }

  const handleExitToSite = () => {
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex items-center gap-3 p-5 border-b border-gray-800">
          <div className="w-9 h-9 rounded-full bg-white p-0.5 shrink-0">
            <img src="/logo.png" alt="Jose For Land" className="w-full h-full object-contain rounded-full" />
          </div>
          <div>
            <div className="text-sm font-bold">Admin Panel</div>
            <div className="text-xs text-gray-400">Jose For Land</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto md:hidden text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
              style={({ isActive }) => isActive ? { backgroundColor: '#FF5A5F' } : {}}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge != null && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-1">
          <button
            onClick={handleExitToSite}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Exit to Site
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ color: '#FCA5A5' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.20)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="font-semibold text-gray-900 flex-1 text-sm md:text-base">
            Admin Dashboard
          </h1>

          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: '#FF5A5F' }}>
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user ? `${user.firstName} ${user.lastName}` : 'Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                {user && (
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(255,90,95,0.10)', color: '#FF5A5F' }}>
                      {user.role}
                    </span>
                  </div>
                )}
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <UserIcon className="w-4 h-4" /> Profile
                </Link>
                <button
                  onClick={handleExitToSite}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                >
                  <ExternalLink className="w-4 h-4" /> Exit to Site
                </button>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left font-semibold"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6" data-scroll-on-nav>
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={confirmSignOut}
        title="Sign out of admin?"
        message="You'll need to log in again to access the admin panel."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        tone="danger"
        icon={LogOut}
        loading={signingOut}
        onConfirm={performSignOut}
        onCancel={() => setConfirmSignOut(false)}
      />
    </div>
  )
}
