import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  FiGrid, FiUsers, FiFileText, FiMessageSquare, FiCheckSquare,
  FiShoppingCart, FiDollarSign, FiActivity, FiBarChart2, FiSettings,
} from 'react-icons/fi'
import useAuth from '../hooks/useAuth'

const ALL_LINKS = [
  { to: '/dashboard',      label: 'Dashboard',       icon: FiGrid,         permission: 'view_dashboard' },
  { to: '/vendors',        label: 'Vendors',          icon: FiUsers,        permission: 'manage_vendors' },
  { to: '/rfqs',           label: 'RFQs',             icon: FiFileText,     permission: 'view_rfq' },
  { to: '/quotations',     label: 'Quotations',       icon: FiMessageSquare,permission: 'submit_quote' },
  { to: '/approvals',      label: 'Approvals',        icon: FiCheckSquare,  permission: 'approve_quote' },
  { to: '/purchase-orders',label: 'Purchase Orders',  icon: FiShoppingCart, permission: 'create_po' },
  { to: '/invoices',       label: 'Invoices',         icon: FiDollarSign,   permission: 'view_invoices' },
  { to: '/activity-logs',  label: 'Activity Logs',    icon: FiActivity,     permission: 'manage_users' },
  { to: '/reports',        label: 'Reports',          icon: FiBarChart2,    permission: 'view_dashboard' },
  { to: '/settings',       label: 'Settings',         icon: FiSettings },
]

const GROUP_LABELS = {
  '/dashboard':       'Main',
  '/vendors':         'Procurement',
  '/rfqs':            'Procurement',
  '/quotations':      'Procurement',
  '/approvals':       'Procurement',
  '/purchase-orders': 'Procurement',
  '/invoices':        'Finance',
  '/activity-logs':   'Admin',
  '/reports':         'Admin',
  '/settings':        'Admin',
}

export default function Sidebar() {
  const { user, hasPermission } = useAuth()

  const links = ALL_LINKS.filter(
    (link) => !link.permission || hasPermission(link.permission),
  )

  // Group links by section label
  const sections = []
  let currentLabel = null
  for (const link of links) {
    const label = GROUP_LABELS[link.to] || ''
    if (label !== currentLabel) {
      sections.push({ label, items: [link] })
      currentLabel = label
    } else {
      sections[sections.length - 1].items.push(link)
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: 'var(--secondary)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      fontFamily: 'var(--font)',
    }}>

      {/* ── Logo ─────────────────────────────── */}
      <div style={{
        padding: '18px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 30, height: 30,
          borderRadius: 6,
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14.5, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            SupplySphere
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Procurement ERP
          </div>
        </div>
      </div>

      {/* ── Navigation ───────────────────────── */}
      <nav style={{ flex: 1, padding: '10px 10px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {sections.map(({ label, items }) => (
          <div key={label} style={{ marginBottom: 6 }}>
            <div style={{
              padding: '8px 10px 4px',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
            }}>
              {label}
            </div>
            {items.map(({ to, label: itemLabel, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '8px 10px',
                  borderRadius: 5,
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.62)',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.14s',
                  marginBottom: 1,
                  borderLeft: `3px solid ${isActive ? '#4C9AFF' : 'transparent'}`,
                })}
                onMouseEnter={e => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                  }
                }}
                onMouseLeave={e => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.background = ''
                    e.currentTarget.style.color = ''
                  }
                }}
              >
                {Icon && <Icon size={15} style={{ flexShrink: 0 }} />}
                {itemLabel}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── User footer ──────────────────────── */}
      {user && (
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 12.5, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: '#fff',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
              {user.role?.replace(/_/g, ' ')}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
