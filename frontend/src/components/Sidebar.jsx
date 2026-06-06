import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  MdDashboard, MdPeople, MdRequestQuote, MdDescription,
  MdThumbUp, MdShoppingCart, MdReceipt, MdHistory,
  MdBarChart, MdSettings 
} from 'react-icons/md'
import useAuth from '../hooks/useAuth'

const links = [
<<<<<<< HEAD
  { to: '/dashboard', label: 'Dashboard', icon: <MdDashboard /> },
  { to: '/vendors', label: 'Vendors', icon: <MdPeople /> },
  { to: '/rfqs', label: 'RFQs', icon: <MdRequestQuote /> },
  { to: '/quotations', label: 'Quotations', icon: <MdDescription /> },
  { to: '/approvals', label: 'Approvals', icon: <MdThumbUp /> },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: <MdShoppingCart /> },
  { to: '/invoices', label: 'Invoices', icon: <MdReceipt /> },
  { to: '/activity-logs', label: 'Activity Logs', icon: <MdHistory /> },
  { to: '/reports', label: 'Reports', icon: <MdBarChart /> },
  { to: '/settings', label: 'Settings', icon: <MdSettings /> },
]

export default function Sidebar() {
  const { user } = useAuth()
  
  return (
    <aside className="w-64 bg-[var(--secondary)] text-[var(--bg-white)] border-r border-[var(--secondary-dark)] flex flex-col h-screen sticky top-0 transition-all duration-[var(--transition-md)] shadow-[var(--shadow-md)]">
      <div className="p-6 flex items-center gap-3 border-b border-[rgba(255,255,255,0.1)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center font-bold text-white">
          S
        </div>
        <span className="text-xl font-bold tracking-wide">SupplySphere</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        <div className="text-xs font-semibold text-[#8b9bb4] uppercase tracking-wider mb-4 px-3">Main Menu</div>
        {links.map(l => (
          <NavLink 
            key={l.to} 
            to={l.to} 
            className={({isActive}) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-all duration-[var(--transition-sm)] font-medium ${
                isActive 
                  ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-sm)]' 
                  : 'text-[#a5b4c4] hover:bg-[var(--secondary-dark)] hover:text-white'
              }`
            }
          >
            <span className="text-lg">{l.icon}</span>
=======
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
>>>>>>> d2c1d536cde09b64832098831a7b915ecb2a5d11
            {l.label}
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
