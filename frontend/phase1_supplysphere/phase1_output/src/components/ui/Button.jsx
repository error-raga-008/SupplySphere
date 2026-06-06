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
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
    padding: '12px 24px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'all var(--transition-sm)',
    fontFamily: 'var(--font)',
    width: '100%',
    ...style,
  }

  const variants = {
    primary: {
      background: 'var(--secondary)',
      color: '#fff',
    },
    blue: {
      background: 'var(--primary)',
      color: '#fff',
    },
    outline: {
      background: 'transparent',
      color: 'var(--secondary)',
      border: '1px solid var(--border)',
    },
  }

  return (
    <button
      style={{ ...base, ...variants[variant] }}
      disabled={loading}
      onMouseEnter={e => {
        if (!loading) {
          if (variant === 'primary') e.currentTarget.style.background = '#013d7a'
          if (variant === 'blue') e.currentTarget.style.background = 'var(--primary-hover)'
          if (variant === 'outline') e.currentTarget.style.background = 'var(--bg)'
        }
      }}
      onMouseLeave={e => {
        if (variant === 'primary') e.currentTarget.style.background = 'var(--secondary)'
        if (variant === 'blue') e.currentTarget.style.background = 'var(--primary)'
        if (variant === 'outline') e.currentTarget.style.background = 'transparent'
      }}
      {...props}
    >
      {loading ? (
        <>
          <span style={{
            width: 16, height: 16,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            display: 'inline-block',
          }} />
          Loading...
        </>
      ) : children}
    </button>
  )
}
