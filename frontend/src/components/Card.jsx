import React from 'react'

// Map icon color → Atlassian lozenge palette
const COLOR_MAP = {
  '#0052CC': { bg: '#DEEBFF', fg: '#0052CC' },
  '#0747A6': { bg: '#DEEBFF', fg: '#0747A6' },
  '#974F0C': { bg: '#FFFAE6', fg: '#974F0C' },
  '#00875A': { bg: '#E3FCEF', fg: '#00875A' },
  '#006644': { bg: '#E3FCEF', fg: '#006644' },
  '#403294': { bg: '#EAE6FF', fg: '#403294' },
  '#008DA6': { bg: '#E6FCFF', fg: '#008DA6' },
  '#BF2600': { bg: '#FFEBE6', fg: '#BF2600' },
  '#DE350B': { bg: '#FFEBE6', fg: '#DE350B' },
}

export default function Card({ title, value, icon: Icon, color = '#0052CC', sub, trend }) {
  const palette = COLOR_MAP[color] || { bg: '#DEEBFF', fg: color }

  return (
    <div style={{
      background: 'var(--bg-white)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      padding: '20px 20px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow 0.18s, border-color 0.18s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        e.currentTarget.style.borderColor = '#C1C7D0'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          lineHeight: '1.4',
        }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: 34, height: 34,
            borderRadius: 'var(--radius-md)',
            background: palette.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: palette.fg,
            flexShrink: 0,
          }}>
            <Icon size={16} />
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <div style={{
          fontSize: 30,
          fontWeight: 700,
          color: 'var(--text-dark)',
          lineHeight: 1,
          letterSpacing: '-0.5px',
        }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}
