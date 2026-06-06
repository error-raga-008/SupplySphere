import React from 'react'

export default function Card({ title, value, icon: Icon, color = 'var(--primary)', sub }) {
  return (
    <div style={{
      background: 'var(--bg-white)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      fontFamily: 'var(--font)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', lineHeight: 1.4 }}>{title}</span>
        {Icon && (
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color,
            flexShrink: 0,
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1, letterSpacing: '-0.5px' }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}
