import { forwardRef, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

const Input = forwardRef(function Input(
  { label, type = 'text', error, icon: Icon, className = '', ...props },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && (
        <label style={{
          fontSize: '11.5px',
          fontWeight: 600,
          color: 'var(--text-dark)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          lineHeight: '16px',
        }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <span style={{
            position: 'absolute', left: '12px',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center',
            pointerEvents: 'none',
          }}>
            <Icon size={15} />
          </span>
        )}

        <input
          ref={ref}
          type={inputType}
          style={{
            width: '100%',
            background: 'var(--bg-white)',
            color: 'var(--text-dark)',
            border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            lineHeight: '20px',
            padding: Icon ? '10px 42px 10px 38px' : '10px 42px 10px 14px',
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            fontFamily: 'var(--font)',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--primary)'
            e.currentTarget.style.boxShadow = 'var(--shadow-blue)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: 'absolute', right: '12px',
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', padding: 0,
            }}
          >
            {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '12px', color: 'var(--danger)', lineHeight: '16px' }}>
          {error}
        </span>
      )}
    </div>
  )
})

export default Input
