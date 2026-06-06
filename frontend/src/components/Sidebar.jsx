import React from 'react'
import { NavLink } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const links = [
  { to: '/dashboard', label: 'Dashboard', permissions: ['view_dashboard'] },
  { to: '/vendors', label: 'Vendors', permissions: ['manage_vendors'] },
  { to: '/rfqs', label: 'RFQs', permissions: ['view_rfq'] },
  { to: '/quotations', label: 'Quotations', permissions: ['view_rfq', 'submit_quote'] },
  { to: '/approvals', label: 'Approvals', permissions: ['approve_quote', 'approve_po'] },
  { to: '/purchase-orders', label: 'Purchase Orders', permissions: ['create_po', 'approve_po'] },
  { to: '/invoices', label: 'Invoices', permissions: ['view_invoices'] },
  { to: '/activity-logs', label: 'Activity Logs', permissions: ['manage_users', 'system_admin'] },
  { to: '/reports', label: 'Reports', permissions: ['view_dashboard'] },
  { to: '/settings', label: 'Settings', permissions: ['system_admin'] },
]

export default function Sidebar() {
  const { permissions } = useAuth()
  const visibleLinks = links.filter((link) => link.permissions.length === 0 || link.permissions.some((permission) => permissions.includes(permission)))

  return (
    <aside className="w-60 bg-white border-r p-4 h-screen sticky top-0">
      <nav className="flex flex-col gap-2">
        {visibleLinks.map(l => (
          <NavLink key={l.to} to={l.to} className={({isActive}) => `p-2 rounded ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
