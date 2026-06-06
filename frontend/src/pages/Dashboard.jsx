import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiFileText, FiClock, FiAlertTriangle, FiShoppingCart,
  FiPlus, FiUsers, FiEye,
} from 'react-icons/fi'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'
import Card from '../components/Card'
import useAuth from '../hooks/useAuth'
import api from '../services/api'
import { dashboardMock } from '../utils/mockData'

// ── Chart data ────────────────────────────────────────────────────────────

const MONTHLY_SPEND = [
  { month: 'Jan', spend: 85000 },
  { month: 'Feb', spend: 112000 },
  { month: 'Mar', spend: 97000 },
  { month: 'Apr', spend: 143000 },
  { month: 'May', spend: 121000 },
  { month: 'Jun', spend: 123456 },
]

const CATEGORY_SPEND = [
  { name: 'IT',           value: 38, color: '#0052CC' },
  { name: 'Construction', value: 27, color: '#00875A' },
  { name: 'Logistics',    value: 18, color: '#974F0C' },
  { name: 'Others',       value: 17, color: '#5E6C84' },
]

const FALLBACK_POS = [
  { id: 1, po_number: 'PO-001', vendor_name: 'Infra Supplies',   total_amount: 87000,  status: 'approved' },
  { id: 2, po_number: 'PO-002', vendor_name: 'Tech Core',        total_amount: 140000, status: 'pending' },
  { id: 3, po_number: 'PO-003', vendor_name: 'OfficeZone Co.',   total_amount: 34900,  status: 'draft' },
  { id: 4, po_number: 'PO-004', vendor_name: 'CloudNet',         total_amount: 98500,  status: 'issued' },
  { id: 5, po_number: 'PO-005', vendor_name: 'FastLog',          total_amount: 22000,  status: 'approved' },
]

const CARDS = [
  { key: 'active_rfqs',       title: 'Active RFQs',       icon: FiFileText,     color: '#0052CC' },
  { key: 'pending_approvals', title: 'Pending Approvals', icon: FiClock,        color: '#974F0C' },
  { key: 'monthly_spend',     title: "PO's This Month",   icon: FiShoppingCart, color: '#00875A', format: v => `₹${(Number(v) / 100000).toFixed(1)}L` },
  { key: 'open_invoices',     title: 'Overdue Invoices',  icon: FiAlertTriangle,color: '#BF2600' },
]

const PO_STATUS = {
  approved:     { bg: '#E3FCEF', color: '#006644' },
  pending:      { bg: '#FFFAE6', color: '#974F0C' },
  draft:        { bg: '#F4F5F7', color: '#42526E' },
  issued:       { bg: '#DEEBFF', color: '#0747A6' },
  acknowledged: { bg: '#EAE6FF', color: '#403294' },
  completed:    { bg: '#E3FCEF', color: '#006644' },
  cancelled:    { bg: '#FFEBE6', color: '#BF2600' },
}

function POStatus({ value }) {
  const s = PO_STATUS[value?.toLowerCase()] || PO_STATUS.draft
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', background: s.bg, color: s.color }}>{value}</span>
}

function SpendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', boxShadow: 'var(--shadow-md)', fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: 3 }}>{label}</div>
      <div style={{ color: 'var(--primary)' }}>₹{Number(payload[0].value).toLocaleString('en-IN')}</div>
    </div>
  )
}

function QuickBtn({ icon: Icon, label, onClick, variant = 'outline' }) {
  const isPrimary = variant === 'primary'
  return (
    <button onClick={onClick} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 16px', border: isPrimary ? 'none' : '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: isPrimary ? 'var(--primary)' : 'var(--bg-white)', color: isPrimary ? '#fff' : 'var(--text-dark)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.14s' }}
      onMouseEnter={e => { if (isPrimary) e.currentTarget.style.background = 'var(--primary-hover)'; else { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' } }}
      onMouseLeave={e => { if (isPrimary) e.currentTarget.style.background = 'var(--primary)'; else { e.currentTarget.style.background = 'var(--bg-white)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dark)' } }}
    >
      <Icon size={14} />{label}
    </button>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(dashboardMock)
  const [poRows, setPoRows] = useState(FALLBACK_POS)
  const [loading, setLoading] = useState(true)

  const roleName = user?.role?.replace(/_/g, ' ')?.replace(/\b\w/g, c => c.toUpperCase()) || 'User'

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/').catch(() => ({ data: dashboardMock })),
      api.get('/dashboard/recent-purchase-orders/').catch(() => ({ data: [] })),
    ]).then(([summaryRes, poRes]) => {
      setStats(summaryRes.data || dashboardMock)
      const rows = Array.isArray(poRes.data) ? poRes.data : (poRes.data?.results || [])
      if (rows.length > 0) setPoRows(rows)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'var(--font)' }}>

      {/* Welcome banner */}
      <div style={{ background: 'var(--secondary)', borderRadius: 'var(--radius-lg)', padding: '20px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'rgba(255,255,255,0.65)' }}>Welcome back, {roleName} — Today's Overview</p>
        </div>
        {Number(stats.pending_approvals) > 0 && (
          <button onClick={() => navigate('/approvals')} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,153,31,0.18)', border: '1px solid rgba(255,153,31,0.4)', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#FFE380', cursor: 'pointer', fontFamily: 'var(--font)', whiteSpace: 'nowrap' }}>
            <FiClock size={14} />{stats.pending_approvals} approval{stats.pending_approvals !== 1 ? 's' : ''} pending
          </button>
        )}
      </div>

      {/* 4 Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {CARDS.map(({ key, title, icon, color, format }) => (
          <Card key={key} title={title} value={loading ? '…' : (format ? format(stats[key] ?? 0) : (stats[key] ?? 0))} icon={icon} color={color} />
        ))}
      </div>

      {/* PO table + Spending chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>

        {/* Recent POs */}
        <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>Recent Purchase Orders</h2>
            <button onClick={() => navigate('/purchase-orders')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font)', padding: '4px 8px', borderRadius: 'var(--radius-md)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <FiEye size={13} />View all
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)' }}>
                {['PO #', 'Vendor', 'Amount', 'Status'].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {poRows.map((row, idx) => (
                <tr key={row.id || idx} style={{ borderBottom: idx < poRows.length - 1 ? '1px solid var(--border-light)' : 'none', transition: 'background 0.1s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{row.po_number}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-dark)' }}>{row.vendor_name || '—'}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-dark)', fontFamily: 'monospace' }}>₹{Number(row.total_amount).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '11px 16px' }}><POStatus value={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Spending Trends */}
        <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: '14px 18px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>Spending Trends — Last 6 Months</h2>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Monthly Spend (₹)</div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={MONTHLY_SPEND} margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052CC" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#0052CC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<SpendTooltip />} />
                <Area type="monotone" dataKey="spend" stroke="#0052CC" strokeWidth={2} fill="url(#spendGrad)" dot={false} activeDot={{ r: 4, fill: '#0052CC' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>By Category</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <PieChart width={80} height={80}>
                <Pie data={CATEGORY_SPEND} dataKey="value" cx={35} cy={35} innerRadius={22} outerRadius={36} paddingAngle={2} strokeWidth={0}>
                  {CATEGORY_SPEND.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {CATEGORY_SPEND.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, color: 'var(--text)' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-dark)' }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: '16px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <QuickBtn icon={FiPlus}  label="+ New RFQ"     onClick={() => navigate('/rfqs')}     variant="primary" />
          <QuickBtn icon={FiUsers} label="Add Vendor"    onClick={() => navigate('/vendors')} />
          <QuickBtn icon={FiEye}   label="View Invoices" onClick={() => navigate('/invoices')} />
        </div>
      </div>
    </div>
  )
}
