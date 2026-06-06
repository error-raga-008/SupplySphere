import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FiBell, FiLogOut, FiChevronDown } from 'react-icons/fi'
import useAuth from '../hooks/useAuth'

const PAGE_META = {
  '/dashboard':       { title: 'Dashboard',              sub: 'Overview of your procurement activity' },
  '/vendors':         { title: 'Vendor Management',      sub: 'Manage and track your vendor network' },
  '/rfqs':            { title: 'Request for Quotations', sub: 'Create and manage procurement RFQs' },
  '/quotations':      { title: 'Quotations',             sub: 'Review vendor quotation submissions' },
  '/approvals':       { title: 'Approval Workflow',      sub: 'Pending and completed approval requests' },
  '/purchase-orders': { title: 'Purchase Orders',        sub: 'Track issued and active purchase orders' },
  '/invoices':        { title: 'Invoices',               sub: 'Manage vendor invoices and payments' },
  '/activity-logs':   { title: 'Activity Logs',          sub: 'Full audit trail of system actions' },
  '/reports':         { title: 'Reports & Analytics',    sub: 'Procurement insights and summaries' },
  '/settings':        { title: 'Settings',               sub: 'Account and system preferences' },
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname] || { title: 'SupplySphere', sub: '' }
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try { await logout() } catch {}
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <header style={{
      height: 58,
      background: 'var(--bg-white)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 1px 0 var(--border)',
      flexShrink: 0,
    }}>

      {/* Page title */}
      <div>
        <h1 style={{
          margin: 0, fontSize: 15.5, fontWeight: 600,
          color: 'var(--text-dark)', letterSpacing: '-0.2px', lineHeight: 1.2,
        }}>
          {meta.title}
        </h1>
        {meta.sub && (
          <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.3 }}>
            {meta.sub}
          </p>
        )}
      </div>

      {/* Right side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

        {/* Bell */}
        <button
          title="Notifications"
          style={{
            width: 34, height: 34,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.14s, color 0.14s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text-dark)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <FiBell size={17} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 6px' }} />

        {/* User chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30,
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 12,
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role?.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 6px' }} />

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--danger)',
            fontSize: 13, fontWeight: 500,
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            transition: 'background 0.14s',
            fontFamily: 'var(--font)',
            opacity: loggingOut ? 0.6 : 1,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#FFEBE6'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <FiLogOut size={14} />
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </header>
  )
}
