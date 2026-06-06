import React, { useState, useEffect } from 'react'
import { FiUser, FiLock, FiSave, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import api from '../services/api'
import useAuth from '../hooks/useAuth'

// ── Shared primitives ─────────────────────────────────────────────────────

function Label({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 5 }}>
      {children}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
    </label>
  )
}

function Field({ label, required, children, error, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {error && <div style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 4 }}>{error}</div>}
      {hint && !error && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '9px 12px',
  fontSize: 13.5,
  border: `1.5px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font)',
  outline: 'none',
  background: 'var(--bg-white)',
  color: 'var(--text-dark)',
  boxSizing: 'border-box',
  transition: 'border-color .15s',
})

function TextInput({ value, onChange, placeholder, disabled, error, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{ ...inputStyle(!!error), ...(disabled ? { background: 'var(--bg)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}) }}
      onFocus={e => { if (!disabled) e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--shadow-blue)' }}
      onBlur={e => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
    />
  )
}

function PasswordInput({ value, onChange, placeholder, error, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{ ...inputStyle(!!error), paddingRight: 40 }}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--shadow-blue)' }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
      />
      <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}>
        {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </button>
    </div>
  )
}

function Toast({ type, message, onClose }) {
  const isSuccess = type === 'success'
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 8, boxShadow: 'var(--shadow-lg)', background: isSuccess ? 'var(--success-bg)' : 'var(--danger-bg)', border: `1px solid ${isSuccess ? 'var(--success)' : 'var(--danger)'}`, maxWidth: 360, animation: 'fadeIn .2s' }}>
      {isSuccess ? <FiCheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> : <FiAlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />}
      <span style={{ fontSize: 13, color: isSuccess ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>{message}</span>
    </div>
  )
}

// ── Tab: Profile ──────────────────────────────────────────────────────────

function ProfileTab({ user, updateUser }) {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setForm({ name: user?.name || '', phone: user?.phone || '' })
  }, [user])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (form.phone && !/^[+\d\s\-()]{7,15}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number'
    return e
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setErrors({})
    setSaving(true)
    try {
      const { data } = await api.put('/auth/profile/', { name: form.name.trim(), phone: form.phone.trim() || null })
      updateUser({ name: data.name, phone: data.phone })
      setToast({ type: 'success', message: 'Profile updated successfully.' })
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to update profile.'
      setToast({ type: 'error', message: msg })
    } finally {
      setSaving(false)
    }
  }

  const roleLabel = (user?.role || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '—'

  return (
    <form onSubmit={handleSave} noValidate>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Avatar row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>{user?.name || '—'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email || '—'}</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', marginTop: 5, padding: '2px 10px', borderRadius: 3, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{roleLabel}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Field label="Full Name" required error={errors.name}>
          <TextInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" error={errors.name} />
        </Field>
        <Field label="Email Address" hint="Email cannot be changed here.">
          <TextInput value={user?.email || ''} disabled />
        </Field>
        <Field label="Phone Number" error={errors.phone} hint="Used for OTP and notifications.">
          <TextInput value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" error={errors.phone} />
        </Field>
        <Field label="Role">
          <TextInput value={roleLabel} disabled />
        </Field>
      </div>

      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: saving ? 'var(--primary-hover)' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13.5, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', transition: 'background .15s' }}>
          <FiSave size={14} />{saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// ── Tab: Security ─────────────────────────────────────────────────────────

function SecurityTab() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const validate = () => {
    const e = {}
    if (!form.current_password) e.current_password = 'Current password is required'
    if (!form.new_password) e.new_password = 'New password is required'
    else if (form.new_password.length < 8) e.new_password = 'Password must be at least 8 characters'
    if (!form.confirm_password) e.confirm_password = 'Please confirm your new password'
    else if (form.new_password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    if (form.current_password && form.new_password && form.current_password === form.new_password)
      e.new_password = 'New password must differ from current password'
    return e
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setErrors({})
    setSaving(true)
    try {
      await api.post('/auth/change-password/', {
        current_password: form.current_password,
        new_password: form.new_password,
        confirm_password: form.confirm_password,
      })
      setForm({ current_password: '', new_password: '', confirm_password: '' })
      setToast({ type: 'success', message: 'Password changed successfully.' })
    } catch (err) {
      const data = err.response?.data
      if (data?.current_password) setErrors(prev => ({ ...prev, current_password: data.current_password[0] }))
      else if (data?.non_field_errors) setErrors(prev => ({ ...prev, confirm_password: data.non_field_errors[0] }))
      else setToast({ type: 'error', message: data?.detail || 'Failed to change password.' })
    } finally {
      setSaving(false)
    }
  }

  const strength = () => {
    const p = form.new_password
    if (!p) return null
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    if (score <= 1) return { label: 'Weak', color: 'var(--danger)', width: '25%' }
    if (score === 2) return { label: 'Fair', color: 'var(--warning)', width: '50%' }
    if (score === 3) return { label: 'Good', color: '#00875A', width: '75%' }
    return { label: 'Strong', color: 'var(--success)', width: '100%' }
  }
  const s = strength()

  return (
    <form onSubmit={handleSave} noValidate>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div style={{ maxWidth: 460 }}>
        <Field label="Current Password" required error={errors.current_password}>
          <PasswordInput value={form.current_password} onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))} placeholder="Enter your current password" error={errors.current_password} autoComplete="current-password" />
        </Field>

        <Field label="New Password" required error={errors.new_password}>
          <PasswordInput value={form.new_password} onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))} placeholder="Minimum 8 characters" error={errors.new_password} autoComplete="new-password" />
          {s && !errors.new_password && (
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 4, background: 'var(--border-light)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: s.width, background: s.color, borderRadius: 2, transition: 'width .3s, background .3s' }} />
              </div>
              <div style={{ fontSize: 11, color: s.color, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
            </div>
          )}
        </Field>

        <Field label="Confirm New Password" required error={errors.confirm_password}>
          <PasswordInput value={form.confirm_password} onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))} placeholder="Repeat the new password" error={errors.confirm_password} autoComplete="new-password" />
        </Field>

        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: saving ? 'var(--primary-hover)' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13.5, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', transition: 'background .15s' }}>
            <FiLock size={14} />{saving ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Security tips */}
      <div style={{ marginTop: 28, padding: '14px 18px', background: 'var(--info-bg)', border: '1px solid #B3D4FF', borderRadius: 'var(--radius-md)' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>Password tips</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text)', lineHeight: 1.8 }}>
          <li>Use at least 8 characters with a mix of letters, numbers, and symbols.</li>
          <li>Avoid using personal information like your name or birthday.</li>
          <li>Don't reuse passwords across different services.</li>
        </ul>
      </div>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'profile',  label: 'Profile',  icon: FiUser },
  { key: 'security', label: 'Security', icon: FiLock },
]

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'var(--font)' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>Settings</h1>
        <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Manage your account profile and security preferences</p>
      </div>

      <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {/* Tab header */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key
            return (
              <button key={key} onClick={() => setActiveTab(key)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 20px', fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? 'var(--primary)' : 'var(--text-muted)', background: 'none', border: 'none', borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s', marginBottom: -1 }}>
                <Icon size={14} />{label}
              </button>
            )
          })}
        </div>

        {/* Tab body */}
        <div style={{ padding: '28px 32px' }}>
          {activeTab === 'profile'  && <ProfileTab  user={user} updateUser={updateUser} />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  )
}
