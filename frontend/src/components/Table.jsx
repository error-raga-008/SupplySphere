import React from 'react'

const STATUS_COLORS = {
  published:    { bg: 'rgba(0,125,252,0.08)',   color: '#007dfc' },
  draft:        { bg: 'rgba(156,163,175,0.15)',  color: '#6b7280' },
  submitted:    { bg: 'rgba(16,185,129,0.1)',    color: '#059669' },
  accepted:     { bg: 'rgba(16,185,129,0.1)',    color: '#059669' },
  approved:     { bg: 'rgba(16,185,129,0.1)',    color: '#059669' },
  rejected:     { bg: 'rgba(239,68,68,0.1)',     color: '#dc2626' },
  cancelled:    { bg: 'rgba(239,68,68,0.1)',     color: '#dc2626' },
  pending:      { bg: 'rgba(245,158,11,0.1)',    color: '#d97706' },
  issued:       { bg: 'rgba(0,125,252,0.08)',    color: '#007dfc' },
  paid:         { bg: 'rgba(16,185,129,0.1)',    color: '#059669' },
  overdue:      { bg: 'rgba(239,68,68,0.1)',     color: '#dc2626' },
  closed:       { bg: 'rgba(156,163,175,0.15)',  color: '#6b7280' },
  revised:      { bg: 'rgba(139,92,246,0.1)',    color: '#7c3aed' },
  acknowledged: { bg: 'rgba(0,125,252,0.08)',    color: '#007dfc' },
  completed:    { bg: 'rgba(16,185,129,0.1)',    color: '#059669' },
}

function StatusBadge({ value }) {
  const s = STATUS_COLORS[value?.toLowerCase()] || { bg: 'rgba(156,163,175,0.15)', color: '#6b7280' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 100,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'capitalize',
      background: s.bg,
      color: s.color,
    }}>
      {value}
    </span>
  )
}

export default function Table({ columns = [], data = [] }) {
  return (
    <div style={{
      background: 'var(--bg-white)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      fontFamily: 'var(--font)',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--secondary)' }}>
            {columns.map(col => (
              <th key={col.accessor} style={{
                padding: '11px 16px',
                textAlign: 'left',
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                No records found
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} style={{
                borderTop: '1px solid var(--border)',
                transition: 'background 0.12s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {columns.map(col => (
                  <td key={col.accessor} style={{ padding: '11px 16px', fontSize: 13.5, color: 'var(--text)' }}>
                    {col.accessor === 'status'
                      ? <StatusBadge value={row[col.accessor]} />
                      : row[col.accessor] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
