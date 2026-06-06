import React, { useState, useEffect, useCallback } from 'react'
import { FiSearch, FiX, FiPlus, FiEye, FiCheck } from 'react-icons/fi'
import { listPOs, createPO, issuePO, cancelPO } from '../services/purchaseOrderService'
import useAuth from '../hooks/useAuth'

const STATUS = {
  draft:        { bg: '#F4F5F7', color: '#42526E' },
  issued:       { bg: '#DEEBFF', color: '#0747A6' },
  acknowledged: { bg: '#EAE6FF', color: '#403294' },
  completed:    { bg: '#E3FCEF', color: '#006644' },
  cancelled:    { bg: '#FFEBE6', color: '#BF2600' },
}

function Badge({ value }) {
  const s = STATUS[value?.toLowerCase()] || STATUS.draft
  return <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', background: s.bg, color: s.color }}>{value}</span>
}

const MOCK = [
  { id: 1, po_number: 'PO-2026-00001', quotation_number: 'QT-2026-00002', vendor_name: 'Tech Core LTD', total_amount: '140000.00', status: 'issued', delivery_date: '2026-07-10', created_at: '2026-06-05T10:00:00Z', created_by_name: 'Procurement Officer' },
  { id: 2, po_number: 'PO-2026-00002', quotation_number: 'QT-2026-00001', vendor_name: 'OfficeZone Furniture', total_amount: '87000.00', status: 'draft', delivery_date: '2026-07-25', created_at: '2026-06-06T09:00:00Z', created_by_name: 'Procurement Officer' },
  { id: 3, po_number: 'PO-2026-00003', quotation_number: 'QT-2026-00005', vendor_name: 'Infra Supplies Pvt Ltd', total_amount: '220000.00', status: 'completed', delivery_date: '2026-05-20', created_at: '2026-05-01T14:00:00Z', created_by_name: 'Admin' },
]

const TABS = ['all', 'draft', 'issued', 'acknowledged', 'completed', 'cancelled']

function PODetail({ po, onClose, onIssue, onCancel, canManage }) {
  const [acting, setActing] = useState(null)
  const act = async (fn, label) => {
    setActing(label)
    try { await fn(po.id); onClose() }
    catch (e) { alert(e.response?.data?.detail || 'Action failed.') }
    finally { setActing(null) }
  }
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.32)', zIndex: 40 }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 440, background: 'var(--bg-white)', zIndex: 50, boxShadow: '-4px 0 24px rgba(9,30,66,0.15)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{po.po_number}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{po.vendor_name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FiX size={18} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Badge value={po.status} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['PO Number', po.po_number],
              ['Quotation', po.quotation_number || '—'],
              ['Vendor', po.vendor_name || '—'],
              ['Total Amount', `₹${Number(po.total_amount).toLocaleString('en-IN')}`],
              ['Delivery Date', po.delivery_date ? new Date(po.delivery_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
              ['Created By', po.created_by_name || '—'],
              ['Created', new Date(po.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{l}</span>
                <span style={{ fontSize: 13, color: 'var(--text-dark)', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
          {po.billing_address && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Billing Address</div>
              <div style={{ fontSize: 13, color: 'var(--text-dark)' }}>{po.billing_address}</div>
            </div>
          )}
          {po.terms_conditions && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Terms & Conditions</div>
              <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.6 }}>{po.terms_conditions}</div>
            </div>
          )}
        </div>
        {canManage && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            {po.status === 'draft' && (
              <>
                <button onClick={() => act(issuePO, 'issue')} disabled={acting === 'issue'} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                  <FiCheck size={13} /> {acting === 'issue' ? 'Issuing…' : 'Issue PO'}
                </button>
                <button onClick={() => act(cancelPO, 'cancel')} disabled={!!acting} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'none', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                  <FiX size={13} /> Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function CreatePOModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ quotation_id: '', delivery_date: '', billing_address: '', terms_conditions: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.quotation_id) { setError('Quotation ID is required.'); return }
    setLoading(true)
    try {
      await createPO({ ...form, quotation_id: parseInt(form.quotation_id) })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.quotation_id?.[0] || 'Failed to create PO.')
    } finally { setLoading(false) }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.5)', zIndex: 60 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 480, background: 'var(--bg-white)', borderRadius: 'var(--radius-xl)', zIndex: 70, boxShadow: '0 20px 60px rgba(9,30,66,0.35)', fontFamily: 'var(--font)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-dark)' }}>Generate Purchase Order</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FiX size={16} /></button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid rgba(222,53,11,.25)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: 13 }}>{error}</div>}
          {[
            { label: 'Quotation ID *', key: 'quotation_id', type: 'number', placeholder: 'Enter accepted quotation ID' },
            { label: 'Delivery Date', key: 'delivery_date', type: 'date' },
            { label: 'Billing Address', key: 'billing_address' },
            { label: 'Terms & Conditions', key: 'terms_conditions', multiline: true },
          ].map(({ label, key, type = 'text', placeholder, multiline }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 5 }}>{label}</label>
              {multiline
                ? <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} rows={3} placeholder={placeholder} style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                : <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }} />
              }
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '9px 20px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '9px 20px', background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating…' : 'Create PO'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function PurchaseOrders() {
  const { hasPermission } = useAuth()
  const canManage = hasPermission('create_po')

  const [pos, setPOs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await listPOs()
      setPOs(Array.isArray(data) ? data : data.results || [])
    } catch { setPOs(MOCK) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = pos.filter(p => {
    const matchTab = tab === 'all' || p.status === tab
    const matchSearch = !search || (p.po_number || '').toLowerCase().includes(search.toLowerCase()) || (p.vendor_name || '').toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })
  const countFor = t => t === 'all' ? pos.length : pos.filter(p => p.status === t).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'var(--font)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>Purchase Orders</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Track and manage all purchase orders</p>
        </div>
        {canManage && (
          <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
            <FiPlus size={15} /> New PO
          </button>
        )}
      </div>
      <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 500, color: tab === t ? 'var(--primary)' : 'var(--text-muted)', borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent', fontFamily: 'var(--font)', textTransform: 'capitalize' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)} <span style={{ fontSize: 11, marginLeft: 4, background: tab === t ? 'var(--primary-light)' : 'var(--bg)', color: tab === t ? 'var(--primary)' : 'var(--text-muted)', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>{countFor(t)}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ position: 'relative', maxWidth: 340 }}>
            <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search POs…" style={{ width: '100%', padding: '8px 12px 8px 32px', fontSize: 13, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg)', boxSizing: 'border-box' }} />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)' }}>
              {['PO #', 'Vendor', 'Amount', 'Status', 'Delivery Date', 'Created By', ''].map(h => (
                <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No purchase orders found</td></tr>
            ) : filtered.map((po, idx) => (
              <tr key={po.id} onClick={() => setSelected(po)} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{po.po_number}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-dark)' }}>{po.vendor_name || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace' }}>₹{Number(po.total_amount).toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 16px' }}><Badge value={po.status} /></td>
                <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{po.delivery_date ? new Date(po.delivery_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--text-muted)' }}>{po.created_by_name || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setSelected(po) }}><FiEye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <PODetail po={selected} onClose={() => { setSelected(null); fetch() }} onIssue={issuePO} onCancel={cancelPO} canManage={canManage} />}
      {showCreate && <CreatePOModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetch() }} />}
    </div>
  )
}
