import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiUser, FiMail, FiPhone, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import styles from './Auth.module.css'

const ROLES = [
  { value: 'procurement_officer', label: 'Procurement Officer', desc: 'Create RFQs, manage POs & invoices' },
  { value: 'vendor',              label: 'Vendor',               desc: 'Submit quotations, track orders' },
  { value: 'manager',             label: 'Manager / Approver',   desc: 'Approve procurement requests' },
  { value: 'admin',               label: 'Admin',                desc: 'Full platform access' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm()

  const password = watch('password')

  async function onSubmit(data) {
    if (!selectedRole) return
    setServerError('')
    try {
      await registerUser({ ...data, role: selectedRole })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const d = err.response?.data
      const msg = d?.detail || d?.message || d?.email?.[0] || 'Registration failed. Try again.'
      setServerError(msg)
    }
  }

  if (success) {
    return (
      <div className={styles.page} style={{ justifyContent: 'center' }}>
        <div className={styles.successCard}>
          <FiCheckCircle size={48} color="var(--primary)" />
          <h2>Account created!</h2>
          <p>Redirecting you to login…</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Left branding */}
      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <div className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#007dfc"/>
              <path d="M8 16L14 10L20 16L14 22L8 16Z" fill="white"/>
              <path d="M16 16L22 10L28 16L22 22L16 16Z" fill="white" opacity="0.6"/>
            </svg>
            <span className={styles.logoText}>SupplySphere</span>
          </div>

          <div className={styles.brandCopy}>
            <h1 className={styles.brandHeading}>
              Join the<br />network.
            </h1>
            <p className={styles.brandSub}>
              Connect with vendors, streamline procurement, and take control of your supply chain.
            </p>
          </div>

          <div className={styles.featureList}>
            {[
              'Role-based access control',
              'Real-time procurement tracking',
              'Automated invoice generation',
              'Multi-level approval workflows',
            ].map(f => (
              <div key={f} className={styles.featureItem}>
                <span className={styles.featureDot} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className={styles.formPanel}>
        <div className={styles.formCard} style={{ maxWidth: 520 }}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Create your account</h2>
            <p className={styles.formSub}>Fill in your details to get started</p>
          </div>

          {serverError && (
            <div className={styles.errorBanner}>
              <FiAlertCircle size={16} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
            {/* Name row */}
            <div className={styles.row2}>
              <Input
                label="First Name"
                icon={FiUser}
                placeholder="Krish"
                error={errors.first_name?.message}
                {...register('first_name', { required: 'First name is required' })}
              />
              <Input
                label="Last Name"
                placeholder="Shah"
                error={errors.last_name?.message}
                {...register('last_name', { required: 'Last name is required' })}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              icon={FiMail}
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email',
                },
              })}
            />

            <Input
              label="Phone Number"
              type="tel"
              icon={FiPhone}
              placeholder="+91 98765 43210"
              error={errors.phone?.message}
              {...register('phone', {
                pattern: { value: /^[+\d\s-]{7,15}$/, message: 'Enter a valid phone number' },
              })}
            />

            {/* Role selector */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '8px',
              }}>
                Select Role *
              </label>
              <div className={styles.roleGrid}>
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.value)
                      setValue('role', r.value)
                    }}
                    className={styles.roleCard}
                    style={{
                      borderColor: selectedRole === r.value ? 'var(--primary)' : 'var(--border)',
                      background: selectedRole === r.value ? 'rgba(0,125,252,0.06)' : 'var(--bg-white)',
                    }}
                  >
                    <span className={styles.roleLabel}>{r.label}</span>
                    <span className={styles.roleDesc}>{r.desc}</span>
                    {selectedRole === r.value && (
                      <span className={styles.roleCheck}>✓</span>
                    )}
                  </button>
                ))}
              </div>
              {!selectedRole && errors.role && (
                <span style={{ fontSize: '12px', color: '#ef4444' }}>Please select a role</span>
              )}
            </div>

            {/* Password row */}
            <div className={styles.row2}>
              <Input
                label="Password"
                type="password"
                icon={FiLock}
                placeholder="Min. 8 characters"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
              />
              <Input
                label="Confirm Password"
                type="password"
                icon={FiLock}
                placeholder="Re-enter password"
                error={errors.confirm_password?.message}
                {...register('confirm_password', {
                  required: 'Please confirm password',
                  validate: v => v === password || 'Passwords do not match',
                })}
              />
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!selectedRole}
            >
              Create Account
            </Button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
