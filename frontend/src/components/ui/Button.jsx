export default function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  style = {},
  ...props
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '20px',
    padding: '10px 20px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'background 0.14s, box-shadow 0.14s',
    fontFamily: 'var(--font)',
    width: '100%',
    letterSpacing: '-0.1px',
    ...style,
  }

  const variants = {
    primary: {
      background: 'var(--primary)',
      color: '#fff',
      boxShadow: 'inset 0 0 0 1px rgba(9,30,66,0.12)',
    },
    secondary: {
      background: 'var(--secondary)',
      color: '#fff',
    },
    outline: {
      background: 'transparent',
      color: 'var(--primary)',
      border: '1px solid var(--primary)',
    },
    subtle: {
      background: 'var(--bg)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
    },
  }

  const hoverBg = {
    primary:   'var(--primary-hover)',
    secondary: '#0E1F38',
    outline:   'var(--primary-light)',
    subtle:    '#EBECF0',
  }

  return (
    <button
      type="button"
      style={{ ...base, ...(variants[variant] || variants.primary) }}
      disabled={loading}
      className={className}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = hoverBg[variant] || hoverBg.primary }}
      onMouseLeave={e => { e.currentTarget.style.background = (variants[variant] || variants.primary).background }}
      {...props}
    >
      {loading ? (
        <>
          <span style={{
            width: 14, height: 14,
            border: '2px solid rgba(255,255,255,0.35)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            display: 'inline-block',
          }} />
          Loading…
        </>
      ) : children}
    </button>
  )
}
