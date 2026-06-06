import React from 'react'
import { useLocation } from 'react-router-dom'
import { FiBell, FiLogOut } from 'react-icons/fi'
import useAuth from '../hooks/useAuth'

const PAGE_TITLES = {
  '/dashboard':       'Dashboard',
  '/vendors':         'Vendor Management',
  '/rfqs':            'Request for Quotations',
  '/quotations':      'Quotations',
  '/approvals':       'Approval Workflow',
  '/purchase-orders': 'Purchase Orders',
  '/invoices':        'Invoices',
  '/activity-logs':   'Activity Logs',
  '/reports':         'Reports & Analytics',
  '/settings':        'Settings',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] || 'SupplySphere'

  return (
    <header style={{
      height: 62,
      background: 'var(--bg-white)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      fontFamily: 'var(--font)',
    }}>
      <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-dark)', letterSpacing: '-0.2px' }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Bell */}
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text)', padding: '7px 8px', borderRadius: 8,
          display: 'flex', alignItems: 'center',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <FiBell size={18} />
        </button>

        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', lineHeight: '1.2' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>
              {user?.role?.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#ef4444', fontSize: 13, fontWeight: 500,
            padding: '7px 10px', borderRadius: 8,
            transition: 'background 0.15s',
            fontFamily: 'var(--font)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <FiLogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  )
}
