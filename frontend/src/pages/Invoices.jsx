import React, { useState, useEffect, useCallback } from 'react'
import { FiSearch, FiX, FiPlus, FiEye, FiCheck, FiSend } from 'react-icons/fi'
import { listInvoices, createInvoice, markInvoiceSent, markInvoicePaid } from '../services/invoiceService'
import useAuth from '../hooks/useAuth'

const STATUS = {
  draft:     { bg: '#F4F5F7', color: '#42526E' },
  sent:      { bg: '#DEEBFF', color: '#0747A6' },
  paid:      { bg: '#E3FCEF', color: '#006644' },
  overdue:   { bg: '#FFEBE6', color: '#BF2600' },
  cancelled: { bg: '#FFFAE6', color: '#974F0C' },
}

function Badge({ value }) {
  const s = STATUS[value?.toLowerCase()] || STATUS.draft
  return <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', background: s.bg, color: s.color }}>{value}</span>
}

const MOCK = [
  { id: 1, invoice_number: 'INV-2026-00001', po_number: 'PO-2026-00001', vendor_name: 'Tech Core LTD', total_amount: '140000.00', amount_paid: '140000.00', amount_due: '0.00', status: 'paid', issue_date: '2026-06-05', due_date: '2026-07-05', created_at: '2026-06-05T10:00:00Z' },
  { id: 2, invoice_number: 'INV-2026-00002', po_number: 'PO-2026-00002', vendor_name: 'OfficeZone Furniture', total_amount: '87000.00', amount_paid: '0.00', amount_due: '87000.00', status: 'sent', issue_date: '2026-06-06', due_date: '2026-07-06', created_at: '2026-06-06T09:00:00Z' },
  { id: 3, invoice_number: 'INV-2026-00003', po_number: 'PO-2026-00003', vendor_name: 'Infra Supplies Pvt Ltd', total_amount: '220000.00', amount_paid: '110000.00', amount_due: '110000.00', status: 'overdue', issue_date: '2026-05-01', due_date: '2026-06-01', created_at: '2026-05-01T14:00:00Z' },
]

const TABS = ['all', 'draft', 'sent', 'paid', 'overdue']

function InvoiceDetail({ inv, onClose, onMarkSent, onMarkPaid, canManage }) {
  const [acting, setActing] = useState(null)
  const act = async (fn, label) => {
    setActing(label)
    try { await fn(inv.id); onClose() }
    catch (e) { alert(e.response?.data?.detail || 'Action failed.') }
    finally { setActing(null) }
  }
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.32)', zIndex: 40 }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 460, background: 'var(--bg-white)', zIndex: 50, boxShadow: '-4px 0 24px rgba(9,30,66,0.15)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{inv.invoice_number}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{inv.vendor_name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FiX size={18} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Badge value={inv.status} />
          {/* Amounts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[['Total', inv.total_amount], ['Paid', inv.amount_paid], ['Due', inv.amount_due]].map(([l, v]) => (
              <div key={l} style={{ padding: '12px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: Number(v) > 0 && l === 'Due' ? 'var(--danger)' : 'var(--text-dark)', marginTop: 4 }}>₹{Number(v).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['PO Number', inv.po_number || '—'],
              ['Vendor', inv.vendor_name || '—'],
              ['Issue Date', inv.issue_date ? new Date(inv.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
              ['Due Date', inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{l}</span>
                <span style={{ fontSize: 13, color: 'var(--text-dark)' }}>{v}</span>
              </div>
            ))}
          </div>
          {inv.notes && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Notes</div>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{inv.notes}</div>
            </div>
          )}
        </div>
        {canManage && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            {inv.status === 'draft' && (
              <button onClick={() => act(markInvoiceSent, 'sent')} disabled={acting === 'sent'} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                <FiSend size={13} /> Mark Sent
              </button>
            )}
            {inv.status === 'sent' && (
              <button onClick={() => act(markInvoicePaid, 'paid')} disabled={acting === 'paid'} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#00875A', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                <FiCheck size={13} /> Mark Paid
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function CreateInvoiceModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ po_id: '', issue_date: '', due_date: '', subtotal: '', cgst_amount: '0', sgst_amount: '0', igst_amount: '0', discount_amount: '0', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.po_id || !form.issue_date || !form.due_date || !form.subtotal) { setError('PO ID, Issue Date, Due Date, and Subtotal are required.'); return }
    setLoading(true)
    try {
      await createInvoice({
        po_id: parseInt(form.po_id),
        issue_date: form.issue_date,
        due_date: form.due_date,
        subtotal: parseFloat(form.subtotal),
        cgst_amount: parseFloat(form.cgst_amount) || 0,
        sgst_amount: parseFloat(form.sgst_amount) || 0,
        igst_amount: parseFloat(form.igst_amount) || 0,
        discount_amount: parseFloat(form.discount_amount) || 0,
        notes: form.notes,
      })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create invoice.')
    } finally { setLoading(false) }
  }

  const inp = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 5 }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.5)', zIndex: 60 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 520, maxHeight: '88vh', overflowY: 'auto', background: 'var(--bg-white)', borderRadius: 'var(--radius-xl)', zIndex: 70, boxShadow: '0 20px 60px rgba(9,30,66,0.35)', fontFamily: 'var(--font)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg-white)', zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-dark)' }}>Create Invoice</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FiX size={16} /></button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {error && <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid rgba(222,53,11,.25)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: 13 }}>{error}</div>}
          {inp('Purchase Order ID *', 'po_id', 'number', 'Enter PO ID')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {inp('Issue Date *', 'issue_date', 'date')}
            {inp('Due Date *', 'due_date', 'date')}
          </div>
          {inp('Subtotal (₹) *', 'subtotal', 'number', '0.00')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {inp('CGST (₹)', 'cgst_amount', 'number', '0.00')}
            {inp('SGST (₹)', 'sgst_amount', 'number', '0.00')}
            {inp('IGST (₹)', 'igst_amount', 'number', '0.00')}
            {inp('Discount (₹)', 'discount_amount', 'number', '0.00')}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 5 }}>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '9px 20px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '9px 20px', background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating…' : 'Create Invoice'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function Invoices() {
  const { hasPermission } = useAuth()
  const canView = hasPermission('view_invoices')
  const canManage = hasPermission('create_po')

  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await listInvoices()
      setInvoices(Array.isArray(data) ? data : data.results || [])
    } catch { setInvoices(MOCK) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = invoices.filter(i => {
    const matchTab = tab === 'all' || i.status === tab
    const matchSearch = !search || (i.invoice_number || '').toLowerCase().includes(search.toLowerCase()) || (i.vendor_name || '').toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })
  const countFor = t => t === 'all' ? invoices.length : invoices.filter(i => i.status === t).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'var(--font)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>Invoices</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Track vendor invoices and payment status</p>
        </div>
        {canManage && (
          <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
            <FiPlus size={15} /> New Invoice
          </button>
        )}
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices…" style={{ width: '100%', padding: '8px 12px 8px 32px', fontSize: 13, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg)', boxSizing: 'border-box' }} />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)' }}>
              {['Invoice #', 'Vendor', 'Total', 'Amount Due', 'Status', 'Due Date', ''].map(h => (
                <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No invoices found</td></tr>
            ) : filtered.map((inv, idx) => (
              <tr key={inv.id} onClick={() => setSelected(inv)} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{inv.invoice_number}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-dark)' }}>{inv.vendor_name || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace' }}>₹{Number(inv.total_amount).toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: Number(inv.amount_due) > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>₹{Number(inv.amount_due).toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 16px' }}><Badge value={inv.status} /></td>
                <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setSelected(inv) }}><FiEye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <InvoiceDetail inv={selected} onClose={() => { setSelected(null); fetch() }} onMarkSent={markInvoiceSent} onMarkPaid={markInvoicePaid} canManage={canManage} />}
      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetch() }} />}
    </div>
  )
}
