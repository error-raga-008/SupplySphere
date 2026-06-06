import React from 'react'
import useAuth from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="text-lg font-semibold">SupplySphere</div>
      <div className="flex items-center gap-4">
        {user && <div className="text-sm">{user.name} ({user.role})</div>}
        <button className="text-sm text-red-600" onClick={logout}>Logout</button>
      </div>
    </div>
  )
}
