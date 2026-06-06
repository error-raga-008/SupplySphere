import { forwardRef, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

const Input = forwardRef(function Input(
  { label, type = 'text', error, icon: Icon, className = '', ...props },
  ref
) {
  const [showPass, setShowPass] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPass ? 'text' : 'password') : type

  return (
    <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: '18px',
          color: 'var(--secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <span style={{
            position: 'absolute',
            left: '14px',
            color: 'var(--muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}>
            <Icon size={16} />
          </span>
        )}

        <input
          ref={ref}
          type={inputType}
          style={{
            width: '100%',
            background: 'var(--bg-white)',
            color: 'var(--secondary)',
            border: `1px solid ${error ? '#ef4444' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            padding: Icon ? '12px 44px 12px 40px' : '12px 44px 12px 16px',
            outline: 'none',
            transition: 'border-color var(--transition-sm), box-shadow var(--transition-sm)',
            fontFamily: 'var(--font)',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--primary)'
            e.target.style.boxShadow = 'var(--shadow-blue)'
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? '#ef4444' : 'var(--border)'
            e.target.style.boxShadow = 'none'
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            style={{
              position: 'absolute',
              right: '14px',
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
            }}
          >
            {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '12px', color: '#ef4444', lineHeight: '16px' }}>
          {error}
        </span>
      )}
    </div>
  )
})

export default Input
