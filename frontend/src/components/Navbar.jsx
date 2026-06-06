import React from 'react'
import { MdNotifications, MdSearch, MdMenu, MdPerson } from 'react-icons/md'
import useAuth from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[var(--bg-white)] border-b border-[var(--border-light)] sticky top-0 z-10 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden text-[var(--text)] hover:text-[var(--primary)] transition-colors">
          <MdMenu className="w-6 h-6" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center relative max-w-md w-full">
          <MdSearch className="absolute left-3 text-[var(--muted)] w-5 h-5" />
          <input
            type="text"
            placeholder="Search RFQs, POs, Vendors..."
            className="w-full bg-[var(--bg)] border border-[var(--border-light)] rounded-[var(--radius-full)] pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-[var(--text)] hover:text-[var(--primary)] transition-colors">
          <MdNotifications className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[var(--accent)] border-2 border-[var(--bg-white)] rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-[var(--border-light)] mx-1"></div>

        {/* User Profile Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-3 hover:bg-[var(--bg)] p-1.5 rounded-[var(--radius-md)] transition-colors">
            <div className="w-9 h-9 rounded-full bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] flex items-center justify-center">
              <MdPerson className="w-6 h-6 text-black" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-[var(--secondary)] leading-tight">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-[var(--muted)]">{user?.role || 'Supply Chain Manager'}</p>
            </div>
          </button>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-1 w-48 bg-[var(--bg-white)] rounded-[var(--radius-md)] shadow-[var(--shadow-md)] border border-[var(--border-light)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <button className="w-full text-left px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--bg)] hover:text-[var(--primary)] transition-colors">
                View Profile
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--bg)] hover:text-[var(--primary)] transition-colors">
                Settings
              </button>
              <div className="h-px bg-[var(--border-light)] my-1"></div>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-[#f23838] hover:cursor-pointer hover:text-[#e74b4b] hover:bg-opacity-10 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

      </div>
    </header>
  )
}
