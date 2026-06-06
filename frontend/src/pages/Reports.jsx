import React, { useState, useEffect } from 'react'
import { FiTrendingUp, FiFileText, FiShoppingCart, FiDollarSign } from 'react-icons/fi'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { getAnalytics } from '../services/reportService'

const PALETTE = ['#0052CC', '#00875A', '#974F0C', '#403294', '#008DA6', '#5E6C84', '#DE350B', '#FF991F']

const inr = n => '₹' + Number(n || 0).toLocaleString('en-IN')
const compact = n => {
  const v = Number(n || 0)
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}k`
  return inr(v)
}
const delta = n => (Number(n) > 0 ? `+${n} this month` : 'No activity this month')

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
          {p.name}: <strong>{p.dataKey === 'spend' ? inr(p.value) : p.value}</strong>
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

const card = { background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    getAnalytics()
      .then(r => { if (active) { setData(r.data); setError('') } })
      .catch(() => { if (active) setError('Could not load analytics. Please try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font)' }}>Loading analytics…</div>
  }
  if (error) {
    return <div style={{ padding: 48, textAlign: 'center', color: 'var(--danger)', fontSize: 14, fontFamily: 'var(--font)' }}>{error}</div>
  }

  const summary = data?.summary || {}
  const tm = summary.this_month || {}
  const monthly = data?.monthly || []
  const topVendors = data?.top_vendors || []
  const categoryRaw = data?.category_spend || []
  const catTotal = categoryRaw.reduce((s, c) => s + Number(c.value || 0), 0) || 1
  const categories = categoryRaw.map((c, i) => ({
    name: c.name,
    value: c.value,
    pct: Math.round((Number(c.value) / catTotal) * 100),
    color: PALETTE[i % PALETTE.length],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'var(--font)' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>Reports & Analytics</h1>
        <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Live procurement performance over the last 6 months</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard title="Total RFQs (6mo)" value={summary.total_rfqs ?? 0} icon={FiFileText} color="#0052CC" sub={delta(tm.rfqs)} />
        <StatCard title="Total Quotations" value={summary.total_quotations ?? 0} icon={FiTrendingUp} color="#403294" sub={delta(tm.quotations)} />
        <StatCard title="Purchase Orders" value={summary.total_pos ?? 0} icon={FiShoppingCart} color="#00875A" sub={delta(tm.pos)} />
        <StatCard title="Total Spend (6mo)" value={compact(summary.total_spend)} icon={FiDollarSign} color="#974F0C" sub={`${compact(tm.spend)} this month`} />
      </div>

      {/* Activity + Spend chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={card}>
          <SectionHeader title="Monthly Activity" sub="RFQs, Quotations, and POs per month" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="rfqs" name="RFQs" fill="#0052CC" radius={[3, 3, 0, 0]} />
              <Bar dataKey="quotations" name="Quotations" fill="#403294" radius={[3, 3, 0, 0]} />
              <Bar dataKey="pos" name="POs" fill="#00875A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <SectionHeader title="Monthly Spend Trend" sub="Total procurement spend (₹)" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="spend" stroke="#0052CC" strokeWidth={2.5} dot={{ r: 4, fill: '#0052CC' }} activeDot={{ r: 6 }} name="Spend" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
        <div style={card}>
          <SectionHeader title="Spend by Category" sub="" />
          {categories.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>No spend data yet</div>
          ) : (
            <>
              <PieChart width={180} height={180} style={{ margin: '0 auto' }}>
                <Pie data={categories} dataKey="value" cx={85} cy={85} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                  {categories.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={v => inr(v)} />
              </PieChart>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                {categories.map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--text)' }}>{c.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dark)' }}>{c.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={card}>
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
              {topVendors.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No purchase orders yet</td></tr>
              ) : topVendors.map((v, idx) => (
                <tr key={v.name + idx} style={{ borderBottom: idx < topVendors.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>{v.name}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontFamily: 'monospace', color: 'var(--primary)' }}>{inr(v.spend)}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>{v.pos}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{inr(v.pos ? Math.round(v.spend / v.pos) : 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
