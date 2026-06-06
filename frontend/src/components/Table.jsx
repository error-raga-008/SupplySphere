import React from 'react'

// Atlassian "lozenge" color map
const LOZENGE = {
  published:    { bg: '#DEEBFF', color: '#0747A6' },
  draft:        { bg: '#F4F5F7', color: '#42526E' },
  submitted:    { bg: '#E3FCEF', color: '#006644' },
  accepted:     { bg: '#E3FCEF', color: '#006644' },
  approved:     { bg: '#E3FCEF', color: '#006644' },
  rejected:     { bg: '#FFEBE6', color: '#BF2600' },
  cancelled:    { bg: '#FFEBE6', color: '#BF2600' },
  pending:      { bg: '#FFFAE6', color: '#974F0C' },
  issued:       { bg: '#DEEBFF', color: '#0747A6' },
  paid:         { bg: '#E3FCEF', color: '#006644' },
  overdue:      { bg: '#FFEBE6', color: '#BF2600' },
  closed:       { bg: '#F4F5F7', color: '#42526E' },
  revised:      { bg: '#EAE6FF', color: '#403294' },
  acknowledged: { bg: '#DEEBFF', color: '#0747A6' },
  completed:    { bg: '#E3FCEF', color: '#006644' },
  active:       { bg: '#E3FCEF', color: '#006644' },
  inactive:     { bg: '#F4F5F7', color: '#42526E' },
}

function Lozenge({ value }) {
  const s = LOZENGE[value?.toLowerCase()] || { bg: '#F4F5F7', color: '#42526E' }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 3,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      background: s.bg,
      color: s.color,
      lineHeight: '18px',
      whiteSpace: 'nowrap',
    }}>
      {value}
    </span>
  )
}

export default function Table({ columns = [], data = [], onRowClick }) {
  return (
    <div style={{
      background: 'var(--bg-white)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{
            background: 'var(--bg-subtle)',
            borderBottom: '2px solid var(--border)',
          }}>
            {columns.map(col => (
              <th key={col.accessor} style={{
                padding: '10px 16px',
                textAlign: 'left',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
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
              <td colSpan={columns.length} style={{
                padding: '36px 16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 13.5,
              }}>
                No records found
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderTop: '1px solid var(--border-light)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                {columns.map(col => (
                  <td key={col.accessor} style={{
                    padding: '11px 16px',
                    fontSize: 13.5,
                    color: 'var(--text-dark)',
                    lineHeight: '1.4',
                  }}>
                    {col.accessor === 'status'
                      ? <Lozenge value={row[col.accessor]} />
                      : (row[col.accessor] ?? '—')}
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
