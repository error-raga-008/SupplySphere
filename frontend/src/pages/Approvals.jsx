import React, { useState, useEffect, useCallback } from 'react'
import { FiCheck, FiX, FiSearch, FiEye } from 'react-icons/fi'
import api from '../services/api'
import useAuth from '../hooks/useAuth'

const STATUS = {
  pending:  { bg: '#FFFAE6', color: '#974F0C' },
  approved: { bg: '#E3FCEF', color: '#006644' },
  rejected: { bg: '#FFEBE6', color: '#BF2600' },
  escalated:{ bg: '#DEEBFF', color: '#0747A6' },
}

function Badge({ value }) {
  const s = STATUS[value?.toLowerCase()] || STATUS.pending
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', background: s.bg, color: s.color }}>{value}</span>
}

const MOCK = [
  { id: 1, quotation_id: 1, quotation_number: 'QT-2026-00001', rfq_title: 'Office Furniture Procurement', vendor_name: 'OfficeZone Furniture', total_amount: '87000.00', status: 'pending', initiated_at: '2026-06-04T10:00:00Z', initiated_by_name: 'Procurement Officer' },
  { id: 2, quotation_id: 2, quotation_number: 'QT-2026-00002', rfq_title: 'IT Equipment — Laptops', vendor_name: 'Tech Core LTD', total_amount: '140000.00', status: 'approved', initiated_at: '2026-06-02T09:30:00Z', initiated_by_name: 'Procurement Officer', resolved_at: '2026-06-03T14:00:00Z' },
  { id: 3, quotation_id: 3, quotation_number: 'QT-2026-00003', rfq_title: 'Security Services', vendor_name: 'SafeGuard Security', total_amount: '55000.00', status: 'rejected', initiated_at: '2026-06-01T11:00:00Z', initiated_by_name: 'Admin', resolved_at: '2026-06-02T10:00:00Z' },
]

const TABS = ['all', 'pending', 'approved', 'rejected']

function ApprovalDetailPanel({ item, onClose, onApprove, onReject, canAct }) {
  const [remarks, setRemarks] = useState('')
  const [acting, setActing] = useState(null)

  const act = async (type) => {
    setActing(type)
    try {
      await (type === 'approve' ? onApprove(item.id, remarks) : onReject(item.id, remarks))
      onClose()
    } finally { setActing(null) }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.32)', zIndex: 40 }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 440, background: 'var(--bg-white)', zIndex: 50, boxShadow: '-4px 0 24px rgba(9,30,66,0.15)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Approval #{item.id}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.quotation_number}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FiX size={18} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Badge value={item.status} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Quotation', item.quotation_number],
              ['RFQ', item.rfq_title],
              ['Vendor', item.vendor_name],
              ['Amount', `₹${Number(item.total_amount).toLocaleString('en-IN')}`],
              ['Initiated By', item.initiated_by_name],
              ['Initiated At', new Date(item.initiated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
              item.resolved_at && ['Resolved At', new Date(item.resolved_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
            ].filter(Boolean).map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{l}</span>
                <span style={{ fontSize: 13, color: 'var(--text-dark)', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
          {canAct && item.status === 'pending' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6 }}>Remarks</label>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} placeholder="Optional remarks…" style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
          )}
        </div>
        {canAct && item.status === 'pending' && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <button onClick={() => act('approve')} disabled={acting === 'approve'} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: 'var(--success)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              <FiCheck size={15} /> {acting === 'approve' ? 'Approving…' : 'Approve'}
            </button>
            <button onClick={() => act('reject')} disabled={acting === 'reject'} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: 'var(--danger)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              <FiX size={15} /> {acting === 'reject' ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default function Approvals() {
  const { hasPermission } = useAuth()
  const canAct = hasPermission('approve_quote')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/approvals/')
      setItems(Array.isArray(data) ? data : data.results || [])
    } catch { setItems(MOCK) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleApprove = async (id, remarks) => {
    await api.post(`/approvals/${id}/approve/`, { remarks })
    fetch()
  }
  const handleReject = async (id, remarks) => {
    await api.post(`/approvals/${id}/reject/`, { remarks })
    fetch()
  }

  const filtered = items.filter(i => {
    const matchTab = tab === 'all' || i.status === tab
    const matchSearch = !search || (i.quotation_number || '').toLowerCase().includes(search.toLowerCase()) || (i.vendor_name || '').toLowerCase().includes(search.toLowerCase()) || (i.rfq_title || '').toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })
  const countFor = t => t === 'all' ? items.length : items.filter(i => i.status === t).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'var(--font)' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>Approval Workflows</h1>
        <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Review and approve or reject pending quotations</p>
      </div>
      <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 16px', borderBottom: '1px solid var(--border)', gap: 2 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 500, color: tab === t ? 'var(--primary)' : 'var(--text-muted)', borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent', fontFamily: 'var(--font)', textTransform: 'capitalize' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)} <span style={{ fontSize: 11, marginLeft: 4, background: tab === t ? 'var(--primary-light)' : 'var(--bg)', color: tab === t ? 'var(--primary)' : 'var(--text-muted)', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>{countFor(t)}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ position: 'relative', maxWidth: 340 }}>
            <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search approvals…" style={{ width: '100%', padding: '8px 12px 8px 32px', fontSize: 13, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg)', boxSizing: 'border-box' }} />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)' }}>
              {['Quotation #', 'RFQ', 'Vendor', 'Amount', 'Status', 'Initiated', ''].map(h => (
                <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No approvals found</td></tr>
            ) : filtered.map((item, idx) => (
              <tr key={item.id} onClick={() => setSelected(item)} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{item.quotation_number}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-dark)', maxWidth: 200 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.rfq_title || '—'}</div></td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-dark)' }}>{item.vendor_name || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace' }}>₹{Number(item.total_amount).toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 16px' }}><Badge value={item.status} /></td>
                <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(item.initiated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                <td style={{ padding: '12px 16px' }}>
                  {item.status === 'pending' && canAct && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={async e => { e.stopPropagation(); if (window.confirm('Approve this quotation?')) { await handleApprove(item.id, ''); } }} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 10px', background: 'var(--success-bg)', border: '1px solid rgba(0,135,90,.3)', borderRadius: 4, color: 'var(--success)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}><FiCheck size={11} /> Approve</button>
                      <button onClick={async e => { e.stopPropagation(); if (window.confirm('Reject this quotation?')) { await handleReject(item.id, ''); } }} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 10px', background: 'var(--danger-bg)', border: '1px solid rgba(222,53,11,.3)', borderRadius: 4, color: 'var(--danger)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}><FiX size={11} /> Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <ApprovalDetailPanel
          item={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          canAct={canAct}
        />
      )}
    </div>
  )
}
