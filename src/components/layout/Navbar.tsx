import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Phone, Heart, ChevronDown, LogOut, User, Building2, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/properties', label: 'Properties' },
    { to: '/map', label: 'Map View' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <>
      {/* Top bar — dark slate */}
      <div className="text-white text-sm py-2 px-4" style={{ backgroundColor: '#293237' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-gray-300 text-xs hidden sm:block">
            Free doorstep consultation — we come to you!
          </span>
          <div className="flex items-center gap-4 ml-auto">
            <a href="tel:+919994488490" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
              <Phone className="w-3.5 h-3.5" style={{ color: '#FF5A5F' }} />
              +91 99944 88490
            </a>
            <a href="tel:+919698712904" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
              <Phone className="w-3.5 h-3.5" style={{ color: '#FF5A5F' }} />
              +91 96987 12904
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar — white */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Jose For Land" className="h-11 w-11 object-contain rounded-full" />
              <div className="hidden sm:block leading-tight">
                <div className="font-bold text-gray-900 text-sm leading-none">Jose For Land</div>
                <div className="text-xs font-medium mt-0.5" style={{ color: '#6A9739' }}>Live where you want</div>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      isActive ? 'text-white rounded-lg' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                  style={({ isActive }) => isActive ? { backgroundColor: '#FF5A5F' } : {}}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/sell"
                className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg transition-colors text-sm"
                style={{ backgroundColor: '#6A9739' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#547a2d')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6A9739')}
              >
                Sell Your Property
              </Link>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: '#FF5A5F' }}>
                      {user?.firstName[0]}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      {/* Identity header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                        <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'rgba(255,90,95,0.10)', color: '#FF5A5F' }}>
                          {user?.role}
                        </span>
                      </div>

                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}>
                        <User className="w-4 h-4" /> Profile
                      </Link>

                      {/* Sellers / Agents → My Properties */}
                      {(user?.role === 'Seller' || user?.role === 'Agent' || user?.role === 'Admin') && (
                        <Link to="/my-properties" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}>
                          <Building2 className="w-4 h-4" /> My Properties
                        </Link>
                      )}

                      <Link to="/favorites" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}>
                        <Heart className="w-4 h-4" /> Saved Properties
                      </Link>

                      {/* Admins → Admin Dashboard */}
                      {user?.role === 'Admin' && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}>
                          <Shield className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}

                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left font-semibold">
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isActive ? 'text-white' : 'text-gray-600 hover:bg-gray-50'}`
                }
                style={({ isActive }) => isActive ? { backgroundColor: '#FF5A5F' } : {}}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/sell" onClick={() => setIsOpen(false)} className="btn-secondary text-sm">Sell Your Property</Link>
              {isAuthenticated && (user?.role === 'Seller' || user?.role === 'Agent' || user?.role === 'Admin') && (
                <Link to="/my-properties" onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> My Properties
                </Link>
              )}
              {isAuthenticated && (
                <Link to="/favorites" onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Saved Properties
                </Link>
              )}
              {isAuthenticated && user?.role === 'Admin' && (
                <Link to="/admin" onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Admin Dashboard
                </Link>
              )}
              {isAuthenticated
                ? <button onClick={handleLogout} className="btn-ghost text-sm justify-start"><LogOut className="w-4 h-4" /> Sign out</button>
                : <Link to="/login" onClick={() => setIsOpen(false)} className="btn-ghost text-sm">Sign in</Link>
              }
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
