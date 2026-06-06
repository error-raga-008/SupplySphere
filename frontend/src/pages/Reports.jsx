import React, { useState, useEffect } from 'react'
import { FiTrendingUp, FiFileText, FiShoppingCart, FiDollarSign } from 'react-icons/fi'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import api from '../services/api'

// ── Mock data for charts ──────────────────────────────────────────────────

const MONTHLY_DATA = [
  { month: 'Jan', rfqs: 4, quotations: 9, pos: 3, spend: 85000 },
  { month: 'Feb', rfqs: 6, quotations: 14, pos: 5, spend: 112000 },
  { month: 'Mar', rfqs: 3, quotations: 8, pos: 4, spend: 97000 },
  { month: 'Apr', rfqs: 8, quotations: 18, pos: 7, spend: 143000 },
  { month: 'May', rfqs: 5, quotations: 11, pos: 4, spend: 121000 },
  { month: 'Jun', rfqs: 6, quotations: 13, pos: 5, spend: 123456 },
]

const VENDOR_CATEGORY = [
  { name: 'IT',           value: 38, color: '#0052CC' },
  { name: 'Construction', value: 27, color: '#00875A' },
  { name: 'Logistics',    value: 18, color: '#974F0C' },
  { name: 'Healthcare',   value: 10, color: '#403294' },
  { name: 'Others',       value: 7,  color: '#5E6C84' },
]

const TOP_VENDORS = [
  { name: 'Tech Core LTD',          spend: 280000, pos: 3 },
  { name: 'Infra Supplies Pvt Ltd', spend: 220000, pos: 2 },
  { name: 'OfficeZone Furniture',   spend: 174000, pos: 2 },
  { name: 'CloudNet Solutions',     spend: 152000, pos: 1 },
  { name: 'Medi Pharma Supplies',   spend: 98000,  pos: 1 },
]

function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: '#00875A', marginTop: 2, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.dataKey === 'spend' ? `₹${Number(p.value).toLocaleString('en-IN')}` : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-dark)' }}>{title}</div>
      {sub && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function Reports() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    api.get('/dashboard/').then(r => setSummary(r.data)).catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'var(--font)' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>Reports & Analytics</h1>
        <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Procurement performance overview for the current period</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard title="Total RFQs (6mo)" value={32} icon={FiFileText} color="#0052CC" sub="+8 this month" />
        <StatCard title="Total Quotations" value={73} icon={FiTrendingUp} color="#403294" sub="+13 this month" />
        <StatCard title="Purchase Orders" value={24} icon={FiShoppingCart} color="#00875A" sub="+5 this month" />
        <StatCard title="Total Spend (6mo)" value="₹6.8L" icon={FiDollarSign} color="#974F0C" sub="+₹1.2L this month" />
      </div>

      {/* Activity + Spend chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <SectionHeader title="Monthly Activity" sub="RFQs, Quotations, and POs per month" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="rfqs" name="RFQs" fill="#0052CC" radius={[3, 3, 0, 0]} />
              <Bar dataKey="quotations" name="Quotations" fill="#403294" radius={[3, 3, 0, 0]} />
              <Bar dataKey="pos" name="POs" fill="#00875A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <SectionHeader title="Monthly Spend Trend" sub="Total procurement spend (₹)" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="spend" stroke="#0052CC" strokeWidth={2.5} dot={{ r: 4, fill: '#0052CC' }} activeDot={{ r: 6 }} name="Spend" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
        <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <SectionHeader title="Spend by Category" sub="" />
          <PieChart width={180} height={180} style={{ margin: '0 auto' }}>
            <Pie data={VENDOR_CATEGORY} dataKey="value" cx={85} cy={85} outerRadius={80} paddingAngle={3} strokeWidth={0}>
              {VENDOR_CATEGORY.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
          </PieChart>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {VENDOR_CATEGORY.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text)' }}>{c.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dark)' }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <SectionHeader title="Top Vendors by Spend" sub="Sorted by total procurement spend" />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)' }}>
                {['Vendor', 'Total Spend', 'POs', 'Avg/PO'].map(h => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_VENDORS.map((v, idx) => (
                <tr key={v.name} style={{ borderBottom: idx < TOP_VENDORS.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>{v.name}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontFamily: 'monospace', color: 'var(--primary)' }}>₹{v.spend.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>{v.pos}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontFamily: 'monospace', color: 'var(--text-muted)' }}>₹{Math.round(v.spend / v.pos).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
