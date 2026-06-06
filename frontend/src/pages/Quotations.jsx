import React, { useState, useEffect, useCallback } from 'react'
import { FiSearch, FiX, FiSend, FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { listQuotations, submitQuotation, acceptQuotation, rejectQuotation } from '../services/quotationService'
import useAuth from '../hooks/useAuth'

const STATUS = {
  draft:     { bg: '#F4F5F7', color: '#42526E' },
  submitted: { bg: '#FFFAE6', color: '#974F0C' },
  accepted:  { bg: '#E3FCEF', color: '#006644' },
  rejected:  { bg: '#FFEBE6', color: '#BF2600' },
  revised:   { bg: '#DEEBFF', color: '#0747A6' },
}

function Badge({ value }) {
  const s = STATUS[value?.toLowerCase()] || STATUS.draft
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', background: s.bg, color: s.color }}>{value}</span>
}

const MOCK = [
  { id: 1, quote_number: 'QT-2026-00001', rfq_id: 1, rfq_number: 'RFQ-2026-00001', rfq_title: 'Office Furniture Procurement', vendor_id: 1, vendor_name: 'OfficeZone Furniture', total_amount: '87000.00', status: 'submitted', delivery_days: 14, submitted_at: '2026-06-04T12:00:00Z', created_at: '2026-06-03T10:00:00Z' },
  { id: 2, quote_number: 'QT-2026-00002', rfq_id: 2, rfq_number: 'RFQ-2026-00002', rfq_title: 'IT Equipment — Laptops', vendor_id: 2, vendor_name: 'Tech Core LTD', total_amount: '140000.00', status: 'accepted', delivery_days: 7, submitted_at: '2026-06-02T11:00:00Z', created_at: '2026-06-01T09:00:00Z' },
  { id: 3, quote_number: 'QT-2026-00003', rfq_id: 2, rfq_number: 'RFQ-2026-00002', rfq_title: 'IT Equipment — Laptops', vendor_id: 5, vendor_name: 'CloudNet Solutions', total_amount: '152000.00', status: 'submitted', delivery_days: 10, submitted_at: '2026-06-02T15:00:00Z', created_at: '2026-06-01T14:00:00Z' },
  { id: 4, quote_number: 'QT-2026-00004', rfq_id: 1, rfq_number: 'RFQ-2026-00001', rfq_title: 'Office Furniture Procurement', vendor_id: 10, vendor_name: 'GreenBuild Materials', total_amount: '95000.00', status: 'rejected', delivery_days: 21, submitted_at: '2026-06-04T14:00:00Z', created_at: '2026-06-03T11:00:00Z' },
]

const TABS = ['all', 'draft', 'submitted', 'accepted', 'rejected']

function QuotationDetail({ item, onClose, onSubmit, onAccept, onReject, canSubmit, canApprove }) {
  const [acting, setActing] = useState(null)
  const act = async (fn, label) => {
    setActing(label)
    try { await fn(item.id); onClose() }
    catch (e) { alert(e.response?.data?.detail || 'Action failed.') }
    finally { setActing(null) }
  }
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.32)', zIndex: 40 }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 440, background: 'var(--bg-white)', zIndex: 50, boxShadow: '-4px 0 24px rgba(9,30,66,0.15)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{item.quote_number}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.rfq_title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FiX size={18} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Badge value={item.status} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Quotation #', item.quote_number],
              ['RFQ', item.rfq_number + ' — ' + item.rfq_title],
              ['Vendor', item.vendor_name],
              ['Total Amount', `₹${Number(item.total_amount).toLocaleString('en-IN')}`],
              ['Delivery Days', item.delivery_days ? `${item.delivery_days} days` : '—'],
              item.submitted_at && ['Submitted', new Date(item.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
              ['Created', new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
            ].filter(Boolean).map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{l}</span>
                <span style={{ fontSize: 13, color: 'var(--text-dark)', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {canSubmit && item.status === 'draft' && (
            <button onClick={() => act(submitQuotation, 'submit')} disabled={acting === 'submit'} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              <FiSend size={13} /> {acting === 'submit' ? 'Submitting…' : 'Submit'}
            </button>
          )}
          {canApprove && item.status === 'submitted' && (
            <>
              <button onClick={() => act(acceptQuotation, 'accept')} disabled={!!acting} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#E3FCEF', border: '1px solid rgba(0,135,90,.3)', borderRadius: 'var(--radius-md)', color: '#006644', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                <FiCheckCircle size={13} /> Accept
              </button>
              <button onClick={() => act(rejectQuotation, 'reject')} disabled={!!acting} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#FFEBE6', border: '1px solid rgba(222,53,11,.3)', borderRadius: 'var(--radius-md)', color: '#BF2600', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                <FiXCircle size={13} /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default function Quotations() {
  const { hasPermission } = useAuth()
  const canSubmit = hasPermission('submit_quote')
  const canApprove = hasPermission('approve_quote')

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await listQuotations()
      setItems(Array.isArray(data) ? data : data.results || [])
    } catch { setItems(MOCK) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = items.filter(i => {
    const matchTab = tab === 'all' || i.status === tab
    const matchSearch = !search || (i.quote_number || '').toLowerCase().includes(search.toLowerCase()) || (i.vendor_name || '').toLowerCase().includes(search.toLowerCase()) || (i.rfq_title || '').toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })
  const countFor = t => t === 'all' ? items.length : items.filter(i => i.status === t).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'var(--font)' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>Quotations</h1>
        <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Review vendor quotations and manage submissions</p>
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quotations…" style={{ width: '100%', padding: '8px 12px 8px 32px', fontSize: 13, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg)', boxSizing: 'border-box' }} />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)' }}>
              {['Quote #', 'RFQ', 'Vendor', 'Amount', 'Delivery', 'Status', 'Submitted', ''].map(h => (
                <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No quotations found</td></tr>
            ) : filtered.map((item, idx) => (
              <tr key={item.id} onClick={() => setSelected(item)} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{item.quote_number}</td>
                <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--text-muted)' }}>{item.rfq_number}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-dark)' }}>{item.vendor_name || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace' }}>₹{Number(item.total_amount).toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--text-muted)' }}>{item.delivery_days ? `${item.delivery_days}d` : '—'}</td>
                <td style={{ padding: '12px 16px' }}><Badge value={item.status} /></td>
                <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setSelected(item) }}><FiEye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <QuotationDetail
          item={selected}
          onClose={() => { setSelected(null); fetch() }}
          onSubmit={() => {}}
          onAccept={() => {}}
          onReject={() => {}}
          canSubmit={canSubmit}
          canApprove={canApprove}
        />
      )}
    </div>
  )
}
