import React, { useState, useEffect, useCallback } from 'react'
import { FiPlus, FiSearch, FiX, FiEdit2, FiTrash2, FiSend, FiEye, FiChevronDown } from 'react-icons/fi'
import { listRFQs, createRFQ, publishRFQ, closeRFQ, cancelRFQ, deleteRFQ } from '../services/rfqService'
import useAuth from '../hooks/useAuth'

// ── Shared style helpers ──────────────────────────────────────────────────

const STATUS = {
  draft:     { bg: '#F4F5F7', color: '#42526E' },
  published: { bg: '#E3FCEF', color: '#006644' },
  closed:    { bg: '#DEEBFF', color: '#0747A6' },
  cancelled: { bg: '#FFEBE6', color: '#BF2600' },
}

function Badge({ value }) {
  const s = STATUS[value?.toLowerCase()] || STATUS.draft
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', background: s.bg, color: s.color }}>
      {value}
    </span>
  )
}

const inputStyle = {
  width: '100%', padding: '8px 12px', fontSize: 13.5,
  border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg-white)',
  color: 'var(--text-dark)', boxSizing: 'border-box',
}

const EMPTY_ITEM = { item_name: '', description: '', quantity: '', unit: '', estimated_price: '' }

// ── RFQ detail slide-over ─────────────────────────────────────────────────

function RFQDetail({ rfq, onClose, onPublish, onClose2, onCancel, onDelete, canEdit }) {
  if (!rfq) return null
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.32)', zIndex: 40 }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 480, background: 'var(--bg-white)', zIndex: 50, boxShadow: '-4px 0 24px rgba(9,30,66,0.15)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>{rfq.rfq_number}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{rfq.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><FiX size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge value={rfq.status} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>by {rfq.created_by_name || '—'}</span>
          </div>

          <Section title="Details">
            <Field label="Deadline" value={rfq.submission_deadline ? new Date(rfq.submission_deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} />
            <Field label="Created" value={rfq.created_at ? new Date(rfq.created_at).toLocaleDateString('en-IN') : '—'} />
            {rfq.description && <Field label="Description" value={rfq.description} />}
          </Section>

          {rfq.items && rfq.items.length > 0 && (
            <Section title={`Items (${rfq.items.length})`}>
              {rfq.items.map((item, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>{item.item_name}</div>
                    {item.description && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{item.description}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.quantity} {item.unit || ''}</div>
                    {item.estimated_price && <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Est. ₹{Number(item.estimated_price).toLocaleString('en-IN')}</div>}
                  </div>
                </div>
              ))}
            </Section>
          )}
        </div>

        {canEdit && rfq.status !== 'cancelled' && rfq.status !== 'closed' && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            {rfq.status === 'draft' && (
              <>
                <ActionBtn icon={FiSend} label="Publish" onClick={() => onPublish(rfq.id)} color="var(--primary)" />
                <ActionBtn icon={FiTrash2} label="Delete" onClick={() => onDelete(rfq.id)} color="var(--danger)" />
              </>
            )}
            {rfq.status === 'published' && (
              <ActionBtn icon={FiX} label="Close" onClick={() => onClose2(rfq.id)} color="var(--warning)" />
            )}
          </div>
        )}
      </div>
    </>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-dark)', textAlign: 'right', maxWidth: 280 }}>{value}</span>
    </div>
  )
}

function ActionBtn({ icon: Icon, label, onClick, color = 'var(--primary)' }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: `1.5px solid ${color}`, borderRadius: 'var(--radius-md)', background: 'none', color, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
      <Icon size={14} /> {label}
    </button>
  )
}

// ── Create RFQ Modal ──────────────────────────────────────────────────────

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', submission_deadline: '' })
  const [items, setItems] = useState([{ ...EMPTY_ITEM }])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }
  const setItem = (i, k, v) => setItems(it => it.map((x, j) => j === i ? { ...x, [k]: v } : x))
  const addItem = () => setItems(it => [...it, { ...EMPTY_ITEM }])
  const removeItem = (i) => setItems(it => it.filter((_, j) => j !== i))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required.'
    if (!form.submission_deadline) e.submission_deadline = 'Deadline is required.'
    else if (new Date(form.submission_deadline) <= new Date()) e.submission_deadline = 'Deadline must be in the future.'
    items.forEach((item, i) => {
      if (!item.item_name.trim()) e[`item_name_${i}`] = 'Required'
      if (!item.quantity || isNaN(item.quantity) || Number(item.quantity) <= 0) e[`quantity_${i}`] = 'Required'
    })
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        items: items.map(it => ({
          item_name: it.item_name,
          description: it.description || '',
          quantity: parseFloat(it.quantity),
          unit: it.unit || '',
          estimated_price: it.estimated_price ? parseFloat(it.estimated_price) : null,
        })),
      }
      await createRFQ(payload)
      onCreated()
    } catch (err) {
      const data = err.response?.data || {}
      setErrors(typeof data === 'object' ? data : { _global: 'Failed to create RFQ.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.5)', zIndex: 60 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 620, maxHeight: '88vh', background: 'var(--bg-white)', borderRadius: 'var(--radius-xl)', zIndex: 70, display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(9,30,66,0.35)', fontFamily: 'var(--font)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>Create New RFQ</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><FiX size={18} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errors._global && <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid rgba(222,53,11,.25)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: 13 }}>{errors._global}</div>}

          <MInput label="Title *" value={form.title} onChange={v => setField('title', v)} error={errors.title} />
          <MInput label="Description" value={form.description} onChange={v => setField('description', v)} multiline />
          <MInput label="Submission Deadline *" type="datetime-local" value={form.submission_deadline} onChange={v => setField('submission_deadline', v)} error={errors.submission_deadline} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>Line Items *</span>
              <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}><FiPlus size={13} /> Add Item</button>
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '12px', marginBottom: 8, background: 'var(--bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Item {i + 1}</span>
                  {items.length > 1 && <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 0 }}><FiX size={14} /></button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <MInput label="Item Name *" value={item.item_name} onChange={v => setItem(i, 'item_name', v)} error={errors[`item_name_${i}`]} compact />
                  </div>
                  <MInput label="Qty *" type="number" value={item.quantity} onChange={v => setItem(i, 'quantity', v)} error={errors[`quantity_${i}`]} compact />
                  <MInput label="Unit" value={item.unit} onChange={v => setItem(i, 'unit', v)} compact placeholder="pcs, kg..." />
                  <MInput label="Est. Price" type="number" value={item.estimated_price} onChange={v => setItem(i, 'estimated_price', v)} compact />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '9px 20px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text-dark)' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '9px 20px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating…' : 'Create RFQ'}
          </button>
        </div>
      </div>
    </>
  )
}

function MInput({ label, value, onChange, error, type = 'text', multiline, compact, placeholder }) {
  const style = { ...inputStyle, ...(compact ? { padding: '6px 10px', fontSize: 13 } : {}), ...(error ? { borderColor: 'var(--danger)' } : {}) }
  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: compact ? 11 : 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: compact ? 3 : 5 }}>{label}</label>}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={{ ...style, resize: 'vertical' }} placeholder={placeholder} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} style={style} placeholder={placeholder} />
      }
      {error && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 3 }}>{error}</div>}
    </div>
  )
}

// ── Mock data fallback ─────────────────────────────────────────────────────

const MOCK_RFQS = [
  { id: 1, rfq_number: 'RFQ-2026-00001', title: 'Office Furniture Procurement', status: 'published', submission_deadline: '2026-07-01T18:00:00Z', created_by_name: 'Procurement Officer', items_count: 3, created_at: '2026-06-01T10:00:00Z' },
  { id: 2, rfq_number: 'RFQ-2026-00002', title: 'IT Equipment — Laptops & Peripherals', status: 'draft', submission_deadline: '2026-07-15T18:00:00Z', created_by_name: 'Procurement Officer', items_count: 5, created_at: '2026-06-03T09:00:00Z' },
  { id: 3, rfq_number: 'RFQ-2026-00003', title: 'Security Services Contract', status: 'closed', submission_deadline: '2026-05-30T18:00:00Z', created_by_name: 'Admin', items_count: 2, created_at: '2026-05-15T11:00:00Z' },
  { id: 4, rfq_number: 'RFQ-2026-00004', title: 'Construction Materials — Phase 2', status: 'published', submission_deadline: '2026-07-20T18:00:00Z', created_by_name: 'Procurement Officer', items_count: 8, created_at: '2026-06-05T14:00:00Z' },
]

const TABS = ['all', 'draft', 'published', 'closed', 'cancelled']

// ── Main page ─────────────────────────────────────────────────────────────

export default function RFQs() {
  const { hasPermission } = useAuth()
  const canCreate = hasPermission('create_rfq')
  const canEdit = hasPermission('edit_rfq')

  const [rfqs, setRFQs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const fetchRFQs = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await listRFQs()
      setRFQs(Array.isArray(data) ? data : data.results || [])
    } catch {
      setRFQs(MOCK_RFQS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRFQs() }, [fetchRFQs])

  const handleAction = async (action, id) => {
    try {
      if (action === 'publish') await publishRFQ(id)
      else if (action === 'close') await closeRFQ(id)
      else if (action === 'cancel') await cancelRFQ(id)
      else if (action === 'delete') await deleteRFQ(id)
      setSelected(null)
      fetchRFQs()
    } catch (err) {
      alert(err.response?.data?.detail || 'Action failed.')
    }
  }

  const filtered = rfqs.filter(r => {
    const matchTab = tab === 'all' || r.status === tab
    const matchSearch = !search || r.rfq_number.toLowerCase().includes(search.toLowerCase()) || r.title.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const countFor = (t) => t === 'all' ? rfqs.length : rfqs.filter(r => r.status === t).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'var(--font)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>Request for Quotations</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Manage procurement requests and invite vendor quotes</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
            <FiPlus size={15} /> New RFQ
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 16px', borderBottom: '1px solid var(--border)', gap: 2 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 500, color: tab === t ? 'var(--primary)' : 'var(--text-muted)', borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent', fontFamily: 'var(--font)', textTransform: 'capitalize', transition: 'color .14s' }}>
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)} <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 4, background: tab === t ? 'var(--primary-light)' : 'var(--bg)', color: tab === t ? 'var(--primary)' : 'var(--text-muted)', padding: '1px 6px', borderRadius: 10 }}>{countFor(t)}</span>
            </button>
          ))}
        </div>
        {/* Search */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ position: 'relative', maxWidth: 340 }}>
            <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search RFQs…" style={{ width: '100%', padding: '8px 32px 8px 32px', fontSize: 13, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg)', color: 'var(--text-dark)', boxSizing: 'border-box' }} />
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FiX size={13} /></button>}
          </div>
        </div>
        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)' }}>
              {['RFQ #', 'Title', 'Status', 'Items', 'Deadline', 'Created By', ''].map(h => (
                <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No RFQs found</td></tr>
            ) : filtered.map((rfq, idx) => (
              <tr key={rfq.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
                onClick={() => setSelected(rfq)}
              >
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{rfq.rfq_number}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-dark)', maxWidth: 240 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rfq.title}</div></td>
                <td style={{ padding: '12px 16px' }}><Badge value={rfq.status} /></td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{rfq.items_count ?? 0}</td>
                <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{rfq.submission_deadline ? new Date(rfq.submission_deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--text-muted)' }}>{rfq.created_by_name || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }} onClick={e => { e.stopPropagation(); setSelected(rfq) }}>
                    <FiEye size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <RFQDetail
          rfq={selected}
          onClose={() => setSelected(null)}
          canEdit={canEdit}
          onPublish={(id) => handleAction('publish', id)}
          onClose2={(id) => handleAction('close', id)}
          onCancel={(id) => handleAction('cancel', id)}
          onDelete={(id) => handleAction('delete', id)}
        />
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchRFQs() }}
        />
      )}
    </div>
  )
}
