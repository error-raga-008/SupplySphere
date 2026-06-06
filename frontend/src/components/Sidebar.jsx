import React from 'react'
import { NavLink } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/vendors', label: 'Vendors' },
  { to: '/rfqs', label: 'RFQs' },
  { to: '/quotations', label: 'Quotations' },
  { to: '/approvals', label: 'Approvals' },
  { to: '/purchase-orders', label: 'Purchase Orders' },
  { to: '/invoices', label: 'Invoices' },
  { to: '/activity-logs', label: 'Activity Logs' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
]

export default function Sidebar() {
  const { user } = useAuth()
  // Example: filter links by role in the future
  return (
    <aside className="w-60 bg-white border-r p-4 h-screen sticky top-0">
      <nav className="flex flex-col gap-2">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} className={({isActive}) => `p-2 rounded ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
