import React, { useRef } from 'react'
import useAuth from '../hooks/useAuth'
import NotificationBell from './notifications/NotificationBell'
import NotificationPanel from './notifications/NotificationPanel'

export default function Navbar() {
  const { user, logout } = useAuth()
  const bellRef = useRef(null)

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b relative z-30">
      <div className="text-lg font-semibold">SupplySphere</div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <NotificationBell ref={bellRef} />
            <div className="text-sm text-[var(--text-dark)]">
              {user.name} ({user.role})
            </div>
          </div>
        )}
        <button
          type="button"
          className="text-sm text-red-600 hover:text-red-700 transition-colors"
          onClick={logout}
        >
          Logout
        </button>
      </div>
      {user && <NotificationPanel bellRef={bellRef} />}
    </div>
  )
}
