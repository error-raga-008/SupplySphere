import React from 'react'
import { NavLink } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import {
  FiGrid, FiUsers, FiFileText, FiMessageSquare, FiCheckSquare,
  FiShoppingCart, FiDollarSign, FiActivity, FiBarChart2, FiSettings,
} from 'react-icons/fi'

const links = [
  { to: '/dashboard',      label: 'Dashboard',       icon: FiGrid },
  { to: '/vendors',        label: 'Vendors',          icon: FiUsers },
  { to: '/rfqs',           label: 'RFQs',             icon: FiFileText },
  { to: '/quotations',     label: 'Quotations',       icon: FiMessageSquare },
  { to: '/approvals',      label: 'Approvals',        icon: FiCheckSquare },
  { to: '/purchase-orders',label: 'Purchase Orders',  icon: FiShoppingCart },
  { to: '/invoices',       label: 'Invoices',         icon: FiDollarSign },
  { to: '/activity-logs',  label: 'Activity Logs',    icon: FiActivity },
  { to: '/reports',        label: 'Reports',          icon: FiBarChart2 },
  { to: '/settings',       label: 'Settings',         icon: FiSettings },
]

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside style={{
      width: 240,
      flexShrink: 0,
      background: 'var(--secondary)',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font)',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#007dfc" />
            <path d="M8 16L14 10L20 16L14 22L8 16Z" fill="white" />
            <path d="M16 16L22 10L28 16L22 22L16 16Z" fill="white" opacity="0.6" />
          </svg>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>
            SupplySphere
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              background: isActive ? 'rgba(0,125,252,0.22)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.18s',
              borderLeft: `3px solid ${isActive ? '#007dfc' : 'transparent'}`,
            })}
            onMouseEnter={e => { if (!e.currentTarget.dataset.active) e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
            onMouseLeave={e => { if (!e.currentTarget.dataset.active) e.currentTarget.style.color = '' }}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      {user && (
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: '#007dfc',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
