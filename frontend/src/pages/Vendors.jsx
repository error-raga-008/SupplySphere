import React, { useState, useEffect, useRef } from 'react'
import {
  FiSearch, FiPlus, FiX, FiEye,
  FiMapPin, FiPhone, FiMail, FiBriefcase, FiFileText, FiStar,
} from 'react-icons/fi'
import { listVendors, createVendor } from '../services/vendorService'
import { vendorsMock, vendorCategoriesMock } from '../utils/mockData'

// ── Status badge ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active:      { label: 'Active',      bg: '#E3FCEF', color: '#006644', dot: '#00875A' },
  pending:     { label: 'Pending',     bg: '#FFFAE6', color: '#974F0C', dot: '#FF991F' },
  blocked:     { label: 'Blocked',     bg: '#FFEBE6', color: '#BF2600', dot: '#DE350B' },
  blacklisted: { label: 'Blocked',     bg: '#FFEBE6', color: '#BF2600', dot: '#DE350B' },
  inactive:    { label: 'Inactive',    bg: '#F4F5F7', color: '#42526E', dot: '#5E6C84' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactive
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 9px', borderRadius: 3,
      fontSize: 11, fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ── Rating ────────────────────────────────────────────────────────────────

function RatingStars({ value }) {
  if (!value) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#FF991F', fontWeight: 600 }}>
      <FiStar size={12} fill="#FF991F" />
      {Number(value).toFixed(1)}
    </span>
  )
}

// ── Detail slide-over ─────────────────────────────────────────────────────

function VendorDetailPanel({ vendor, onClose }) {
  if (!vendor) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(23,43,77,0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 40,
          animation: 'vnd-fadeIn 0.18s ease',
        }}
      />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0,
        width: 420, background: 'var(--bg-white)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 50, overflowY: 'auto',
        animation: 'vnd-slideIn 0.22s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* header */}
        <div style={{
          padding: '22px 24px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.3 }}>
              {vendor.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <StatusBadge status={vendor.status} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{vendor.category}</span>
              <RatingStars value={vendor.rating} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, flexShrink: 0,
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <FiX size={15} />
          </button>
        </div>

        {/* content */}
        <div style={{ padding: '18px 24px', flex: 1 }}>
          <PanelSection title="Contact Information">
            <DetailRow icon={<FiMail size={13} />}      label="Email"          value={vendor.email} />
            <DetailRow icon={<FiPhone size={13} />}     label="Phone"          value={vendor.phone} />
            <DetailRow icon={<FiBriefcase size={13} />} label="Contact Person" value={vendor.contact_person} />
          </PanelSection>

          <PanelSection title="Business Details" mt>
            <DetailRow icon={<FiFileText size={13} />}  label="GST Number" value={vendor.gst_number || '—'} mono />
            <DetailRow icon={<FiFileText size={13} />}  label="PAN Number" value={vendor.pan_number || '—'} mono />
            <DetailRow icon={<FiBriefcase size={13} />} label="Category"   value={vendor.category} />
          </PanelSection>

          <PanelSection title="Address" mt>
            <div style={{
              background: 'var(--bg)', borderRadius: 'var(--radius-lg)',
              padding: '12px 14px', fontSize: 13,
              color: 'var(--text)', lineHeight: 1.7,
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <FiMapPin size={14} style={{ flexShrink: 0, marginTop: 3, color: 'var(--primary)' }} />
                <div>
                  {vendor.address && <div>{vendor.address}</div>}
                  {(vendor.city || vendor.state) && (
                    <div>{[vendor.city, vendor.state].filter(Boolean).join(', ')}</div>
                  )}
                  {(vendor.pincode || vendor.country) && (
                    <div>{[vendor.pincode, vendor.country].filter(Boolean).join(' · ')}</div>
                  )}
                </div>
              </div>
            </div>
          </PanelSection>

          {vendor.bank_name && (
            <PanelSection title="Banking Details" mt>
              <DetailRow label="Bank Name"   value={vendor.bank_name} />
              <DetailRow label="Account No." value={vendor.bank_account_no || '—'} mono />
              <DetailRow label="IFSC Code"   value={vendor.bank_ifsc || '—'} mono />
            </PanelSection>
          )}
        </div>

        {/* footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '9px 0',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-dark)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}

function PanelSection({ title, children, mt }) {
  return (
    <div style={{ marginTop: mt ? 18 : 0 }}>
      <div style={{
        fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function DetailRow({ icon, label, value, mono }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: '1px solid var(--border-light)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', minWidth: 130 }}>
        {icon}{label}
      </div>
      <span style={{
        fontSize: 13, color: 'var(--text-dark)', fontWeight: 500,
        fontFamily: mono ? 'monospace' : 'var(--font)',
        textAlign: 'right', wordBreak: 'break-all', maxWidth: 210,
      }}>
        {value || '—'}
      </span>
    </div>
  )
}

// ── Add Vendor Modal ──────────────────────────────────────────────────────

const INITIAL_FORM = {
  name: '', category: '', contact_person: '', email: '',
  phone: '', gst_number: '', pan_number: '', address: '',
  city: '', state: '', pincode: '', status: 'pending',
}

function AddVendorModal({ onClose, onSave }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const change = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name     = 'Company name is required'
    if (!form.email.trim())    e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.category.trim()) e.category = 'Category is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await createVendor(form)
    } catch {
      // API not available — use mock path
    }
    onSave({ ...form, id: Date.now(), status: form.status || 'pending', created_at: new Date().toISOString() })
    setSaving(false)
    onClose()
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(23,43,77,0.4)',
          backdropFilter: 'blur(3px)',
          zIndex: 40,
          animation: 'vnd-fadeIn 0.18s ease',
        }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 'min(640px, calc(100vw - 32px))',
        maxHeight: 'calc(100vh - 64px)',
        background: 'var(--bg-white)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 50, display: 'flex', flexDirection: 'column',
        animation: 'vnd-modalIn 0.22s cubic-bezier(0.22,1,0.36,1)',
        overflow: 'hidden',
      }}>
        {/* header */}
        <div style={{
          padding: '20px 28px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>
              Add New Vendor
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
              Fill in supplier details to register a new vendor
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30,
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <FiX size={15} />
          </button>
        </div>

        {/* body */}
        <div style={{ padding: '20px 28px', overflowY: 'auto', flex: 1 }}>
          <ModalSection label="Basic Information">
            <ModalGrid>
              <ModalField label="Company Name *" error={errors.name}>
                <ModalInput value={form.name} onChange={change('name')} placeholder="e.g. Infra Supplies Pvt Ltd" error={errors.name} />
              </ModalField>
              <ModalField label="Category *" error={errors.category}>
                <ModalSelect value={form.category} onChange={change('category')} error={errors.category}>
                  <option value="">Select category</option>
                  {vendorCategoriesMock.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </ModalSelect>
              </ModalField>
              <ModalField label="Contact Person">
                <ModalInput value={form.contact_person} onChange={change('contact_person')} placeholder="Full name" />
              </ModalField>
              <ModalField label="Status">
                <ModalSelect value={form.status} onChange={change('status')}>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </ModalSelect>
              </ModalField>
            </ModalGrid>
          </ModalSection>

          <ModalSection label="Contact Details" mt>
            <ModalGrid>
              <ModalField label="Email Address *" error={errors.email}>
                <ModalInput type="email" value={form.email} onChange={change('email')} placeholder="vendor@example.com" error={errors.email} />
              </ModalField>
              <ModalField label="Phone Number">
                <ModalInput value={form.phone} onChange={change('phone')} placeholder="+91 98765 43210" />
              </ModalField>
            </ModalGrid>
          </ModalSection>

          <ModalSection label="Tax & Compliance" mt>
            <ModalGrid>
              <ModalField label="GST Number">
                <ModalInput value={form.gst_number} onChange={change('gst_number')} placeholder="27AABCS1429Bz0" mono />
              </ModalField>
              <ModalField label="PAN Number">
                <ModalInput value={form.pan_number} onChange={change('pan_number')} placeholder="AABCS1429B" mono />
              </ModalField>
            </ModalGrid>
          </ModalSection>

          <ModalSection label="Address" mt>
            <ModalField label="Street Address" fullWidth>
              <ModalInput value={form.address} onChange={change('address')} placeholder="Building, street, area" />
            </ModalField>
            <ModalGrid style={{ marginTop: 10 }}>
              <ModalField label="City">
                <ModalInput value={form.city} onChange={change('city')} placeholder="City" />
              </ModalField>
              <ModalField label="State">
                <ModalInput value={form.state} onChange={change('state')} placeholder="State" />
              </ModalField>
              <ModalField label="Pincode">
                <ModalInput value={form.pincode} onChange={change('pincode')} placeholder="400001" />
              </ModalField>
            </ModalGrid>
          </ModalSection>
        </div>

        {/* footer */}
        <div style={{
          padding: '14px 28px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-dark)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '9px 20px', borderRadius: 'var(--radius-md)',
              border: 'none', background: 'var(--primary)',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font)',
            }}
          >
            {saving ? 'Saving…' : <><FiPlus size={14} /> Add Vendor</>}
          </button>
        </div>
      </div>
    </>
  )
}

function ModalSection({ label, children, mt }) {
  return (
    <div style={{ marginTop: mt ? 20 : 0 }}>
      <div style={{
        fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function ModalGrid({ children, style }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 16px', ...style }}>
      {children}
    </div>
  )
}

function ModalField({ label, error, children, fullWidth }) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.05em', color: 'var(--text-dark)',
      }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{error}</span>}
    </div>
  )
}

function ModalInput({ error, mono, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e) }}
      onBlur={e => { setFocused(false); props.onBlur?.(e) }}
      style={{
        width: '100%', boxSizing: 'border-box',
        padding: '9px 12px', fontSize: 13,
        border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        outline: 'none', background: 'var(--bg-white)',
        color: 'var(--text-dark)',
        fontFamily: mono ? 'monospace' : 'var(--font)',
        boxShadow: focused ? 'var(--shadow-blue)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    />
  )
}

function ModalSelect({ error, children, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <select
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e) }}
      onBlur={e => { setFocused(false); props.onBlur?.(e) }}
      style={{
        width: '100%', boxSizing: 'border-box',
        padding: '9px 32px 9px 12px', fontSize: 13,
        border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        outline: 'none', background: 'var(--bg-white)',
        color: 'var(--text-dark)', fontFamily: 'var(--font)',
        cursor: 'pointer', appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235E6C84' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
        boxShadow: focused ? 'var(--shadow-blue)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {children}
    </select>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────

const TABS = [
  { key: 'all',     label: 'All',     filter: () => true },
  { key: 'active',  label: 'Active',  filter: v => v.status === 'active' },
  { key: 'pending', label: 'Pending', filter: v => v.status === 'pending' },
  { key: 'blocked', label: 'Blocked', filter: v => ['blocked', 'blacklisted'].includes(v.status) },
]

export default function Vendors() {
  const [vendors, setVendors]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState('all')
  const [search, setSearch]         = useState('')
  const [viewVendor, setViewVendor] = useState(null)
  const [showAdd, setShowAdd]       = useState(false)
  const searchRef = useRef(null)

  // inject animations once
  useEffect(() => {
    const id = 'vendors-anim'
    if (document.getElementById(id)) return
    const s = document.createElement('style')
    s.id = id
    s.textContent = `
      @keyframes vnd-fadeIn  { from { opacity:0 } to { opacity:1 } }
      @keyframes vnd-slideIn { from { transform:translateX(32px); opacity:0 } to { transform:translateX(0); opacity:1 } }
      @keyframes vnd-modalIn { from { transform:translate(-50%,-48%) scale(0.97); opacity:0 } to { transform:translate(-50%,-50%) scale(1); opacity:1 } }
      .vnd-row:hover { background: var(--bg) !important; }
      .vnd-view-btn:hover { background: var(--secondary) !important; color:#fff !important; border-color:var(--secondary) !important; }
      .vnd-add-btn:hover { background: var(--primary-hover) !important; }
    `
    document.head.appendChild(s)
  }, [])

  // fetch vendors
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listVendors()
      .then(res => { if (!cancelled) setVendors(res.data?.results ?? res.data ?? []) })
      .catch(() => { if (!cancelled) setVendors(vendorsMock) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const counts = {
    all:     vendors.length,
    active:  vendors.filter(v => v.status === 'active').length,
    pending: vendors.filter(v => v.status === 'pending').length,
    blocked: vendors.filter(v => ['blocked', 'blacklisted'].includes(v.status)).length,
  }

  const tabFilter = TABS.find(t => t.key === tab)?.filter ?? (() => true)
  const filtered  = vendors.filter(tabFilter).filter(v => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (v.name        || '').toLowerCase().includes(q) ||
      (v.gst_number  || '').toLowerCase().includes(q) ||
      (v.category    || '').toLowerCase().includes(q) ||
      (v.email       || '').toLowerCase().includes(q) ||
      (v.phone       || '').includes(q)
    )
  })

  const handleAddSave = (newVendor) => setVendors(prev => [newVendor, ...prev])

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* ── Page header ─────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2 }}>
            Vendors
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
            Manage supplier profiles and registrations
          </p>
        </div>
        <button
          className="vnd-add-btn"
          onClick={() => setShowAdd(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 'var(--radius-md)',
            background: 'var(--primary)', color: '#fff',
            border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)',
            transition: 'background 0.14s',
          }}
        >
          <FiPlus size={14} />
          Add Vendor
        </button>
      </div>

      {/* ── Main card ───────────────────────────── */}
      <div style={{
        background: 'var(--bg-white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>

        {/* Search + tabs toolbar */}
        <div style={{ padding: '16px 18px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <FiSearch size={14} style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, GST, category, email…"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 34px 9px 34px',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13, color: 'var(--text-dark)',
                background: 'var(--bg-subtle)', outline: 'none',
                fontFamily: 'var(--font)', transition: 'border-color 0.15s, background 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg-subtle)' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 2,
                }}
              >
                <FiX size={13} />
              </button>
            )}
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 2, marginBottom: -1 }}>
            {TABS.map(t => {
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px',
                    border: 'none', background: 'transparent',
                    cursor: 'pointer', fontFamily: 'var(--font)',
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    color: active ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                    borderRadius: '4px 4px 0 0',
                    transition: 'color 0.14s',
                  }}
                >
                  {t.label}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: 20, height: 18, padding: '0 5px',
                    borderRadius: 100, fontSize: 11, fontWeight: 700,
                    background: active ? 'var(--primary-light)' : 'var(--border-light)',
                    color: active ? 'var(--primary)' : 'var(--text-muted)',
                  }}>
                    {counts[t.key]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              border: '2.5px solid var(--border)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 0.75s linear infinite',
            }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading vendors…</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)' }}>
                  {[
                    { label: 'Vendor Name', align: 'left' },
                    { label: 'Category',    align: 'left' },
                    { label: 'GST Number',  align: 'left' },
                    { label: 'Contact No.', align: 'left' },
                    { label: 'Status',      align: 'left' },
                    { label: 'Action',      align: 'center' },
                  ].map(h => (
                    <th key={h.label} style={{
                      padding: '10px 16px',
                      textAlign: h.align,
                      fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}>
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                          background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 22,
                        }}>
                          📦
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>No vendors found</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {search ? 'Try adjusting your search or filter' : 'Add a vendor to get started'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((v, idx) => (
                    <tr
                      key={v.id ?? idx}
                      className="vnd-row"
                      style={{
                        borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                        transition: 'background 0.1s',
                      }}
                    >
                      {/* Vendor Name */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.3 }}>
                          {v.name}
                        </div>
                        {v.email && (
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{v.email}</div>
                        )}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '12px 16px' }}>
                        {v.category ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '2px 9px', borderRadius: 3,
                            background: 'var(--primary-light)', color: 'var(--primary)',
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                          }}>
                            {v.category}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                        )}
                      </td>

                      {/* GST */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 12.5, color: 'var(--text)', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                          {v.gst_number || <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>—</span>}
                        </span>
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 13, color: 'var(--text)' }}>
                          {v.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={v.status} />
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          className="vnd-view-btn"
                          onClick={() => setViewVendor(v)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '6px 13px', borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-white)', cursor: 'pointer',
                            fontSize: 12, fontWeight: 600, color: 'var(--text)',
                            fontFamily: 'var(--font)', transition: 'all 0.14s',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <FiEye size={12} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-light)',
            fontSize: 12, color: 'var(--text-muted)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>
              Showing <strong style={{ color: 'var(--text-dark)' }}>{filtered.length}</strong> of{' '}
              <strong style={{ color: 'var(--text-dark)' }}>{vendors.length}</strong> vendors
            </span>
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: 'var(--primary)', fontFamily: 'var(--font)', fontWeight: 500, padding: 0,
                }}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Overlays */}
      {viewVendor && <VendorDetailPanel vendor={viewVendor} onClose={() => setViewVendor(null)} />}
      {showAdd    && <AddVendorModal onClose={() => setShowAdd(false)} onSave={handleAddSave} />}
    </div>
  )
}
