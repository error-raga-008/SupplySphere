import React, { useState, useEffect, useCallback } from 'react'
import { FiSearch, FiActivity } from 'react-icons/fi'
import api from '../services/api'

const ENTITY_COLORS = {
  rfq:               { bg: '#DEEBFF', color: '#0052CC' },
  quotation:         { bg: '#EAE6FF', color: '#403294' },
  vendor:            { bg: '#E3FCEF', color: '#006644' },
  purchase_order:    { bg: '#FFFAE6', color: '#974F0C' },
  invoice:           { bg: '#FFEBE6', color: '#BF2600' },
  approval_workflow: { bg: '#E6FCFF', color: '#008DA6' },
  user:              { bg: '#F4F5F7', color: '#42526E' },
  notification:      { bg: '#F4F5F7', color: '#42526E' },
}

function EntityBadge({ type }) {
  const s = ENTITY_COLORS[type?.toLowerCase()] || { bg: '#F4F5F7', color: '#42526E' }
  return <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: s.bg, color: s.color }}>{type?.replace(/_/g, ' ')}</span>
}

const ACTION_LABEL = {
  'auth.login': 'User Login',
  'auth.logout': 'User Logout',
  'auth.register': 'User Registered',
  'auth.password_reset': 'Password Reset',
  'auth.profile_update': 'Profile Updated',
  'rfq.created': 'RFQ Created',
  'rfq.published': 'RFQ Published',
  'rfq.deleted': 'RFQ Deleted',
  'quotation.created': 'Quotation Created',
  'quotation.submitted': 'Quotation Submitted',
  'approval.initiated': 'Approval Initiated',
  'approval.approved': 'Approval Approved',
  'approval.rejected': 'Approval Rejected',
  'po.created': 'PO Created',
  'po.issued': 'PO Issued',
  'invoice.created': 'Invoice Created',
  'invoice.paid': 'Invoice Paid',
  'vendor.created': 'Vendor Added',
  'vendor.updated': 'Vendor Updated',
  'vendor.deleted': 'Vendor Deleted',
  'vendor.blocked': 'Vendor Blocked',
  'vendor.activated': 'Vendor Activated',
  'vendor.blacklisted': 'Vendor Blacklisted',
}

const MOCK = [
  { id: 1, user_name: 'Procurement Officer', user_email: 'procurement@demo.com', action: 'rfq.published', entity_type: 'rfq', entity_id: '1', ip_address: '127.0.0.1', created_at: '2026-06-06T10:30:00Z' },
  { id: 2, user_name: 'Admin', user_email: 'admin@demo.com', action: 'vendor.activated', entity_type: 'vendor', entity_id: '3', ip_address: '127.0.0.1', created_at: '2026-06-06T09:15:00Z' },
  { id: 3, user_name: 'Manager', user_email: 'manager@demo.com', action: 'approval.approved', entity_type: 'approval_workflow', entity_id: '2', ip_address: '192.168.1.5', created_at: '2026-06-05T14:20:00Z' },
  { id: 4, user_name: 'Procurement Officer', user_email: 'procurement@demo.com', action: 'po.issued', entity_type: 'purchase_order', entity_id: '1', ip_address: '127.0.0.1', created_at: '2026-06-05T11:00:00Z' },
  { id: 5, user_name: 'Procurement Officer', user_email: 'procurement@demo.com', action: 'rfq.created', entity_type: 'rfq', entity_id: '2', ip_address: '127.0.0.1', created_at: '2026-06-04T16:45:00Z' },
  { id: 6, user_name: 'Admin', user_email: 'admin@demo.com', action: 'vendor.created', entity_type: 'vendor', entity_id: '11', ip_address: '127.0.0.1', created_at: '2026-06-03T08:00:00Z' },
  { id: 7, user_name: 'Vendor User', user_email: 'vendor@demo.com', action: 'quotation.submitted', entity_type: 'quotation', entity_id: '1', ip_address: '10.0.0.2', created_at: '2026-06-02T12:30:00Z' },
  { id: 8, user_name: 'Procurement Officer', user_email: 'procurement@demo.com', action: 'auth.login', entity_type: 'user', entity_id: '3', ip_address: '127.0.0.1', created_at: '2026-06-01T09:00:00Z' },
]

export default function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (entityFilter) params.entity_type = entityFilter
      const { data } = await api.get('/activity-logs/', { params })
      setLogs(Array.isArray(data) ? data : data.results || [])
    } catch { setLogs(MOCK) }
    finally { setLoading(false) }
  }, [entityFilter])

  useEffect(() => { fetch() }, [fetch])

  const filtered = logs.filter(l =>
    !search || (l.action || '').toLowerCase().includes(search.toLowerCase()) || (l.user_name || '').toLowerCase().includes(search.toLowerCase()) || (l.entity_type || '').toLowerCase().includes(search.toLowerCase())
  )

  const ENTITY_OPTIONS = ['', 'rfq', 'quotation', 'vendor', 'purchase_order', 'invoice', 'approval_workflow', 'user']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'var(--font)' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>Activity Logs</h1>
        <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Complete audit trail of all system activities</p>
      </div>
      <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 340 }}>
            <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…" style={{ width: '100%', padding: '8px 12px 8px 32px', fontSize: 13, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg)', boxSizing: 'border-box' }} />
          </div>
          <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} style={{ padding: '8px 12px', fontSize: 13, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg-white)', color: 'var(--text-dark)', cursor: 'pointer' }}>
            <option value="">All Entities</option>
            {ENTITY_OPTIONS.filter(Boolean).map(e => (
              <option key={e} value={e}>{e.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)' }}>
              {['Action', 'Entity', 'Entity ID', 'User', 'IP Address', 'Time'].map(h => (
                <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No activity logs found</td></tr>
            ) : filtered.map((log, idx) => (
              <tr key={log.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-light)' : 'none', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '11px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiActivity size={13} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>{ACTION_LABEL[log.action] || log.action}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.action}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '11px 16px' }}><EntityBadge type={log.entity_type} /></td>
                <td style={{ padding: '11px 16px', fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{log.entity_id}</td>
                <td style={{ padding: '11px 16px' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-dark)' }}>{log.user_name || 'System'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.user_email || ''}</div>
                </td>
                <td style={{ padding: '11px 16px', fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.ip_address || '—'}</td>
                <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(log.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
