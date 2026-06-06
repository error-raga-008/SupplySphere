import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiUser, FiMail, FiPhone, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import * as authService from '../services/authService'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import styles from './auth/Auth.module.css'

const ROLES = [
  { id: 1, name: 'admin', label: 'Admin', desc: 'Full platform access' },
  { id: 2, name: 'procurement_officer', label: 'Procurement Officer', desc: 'Create RFQs, manage POs & invoices' },
  { id: 3, name: 'vendor', label: 'Vendor', desc: 'Submit quotations, track orders' },
  { id: 4, name: 'manager', label: 'Manager / Approver', desc: 'Approve procurement requests' },
]

export default function Signup() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm()

  const password = watch('password')

  async function onSubmit(data) {
    if (!selectedRoleId) {
      setServerError('Please select a role.')
      return
    }

    setServerError('')

    try {
      await authService.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role_id: selectedRoleId,
      })
      setSuccess(true)
      window.setTimeout(() => navigate('/login', { replace: true }), 1800)
    } catch (error) {
      if (!error.response) {
        setServerError('Cannot connect to server. Make sure the backend is running.')
        return
      }
      const payload = error.response.data
      // DRF returns field errors as { field: ["msg"] } or { detail: "msg" }
      const message =
        payload?.detail ||
        payload?.message ||
        Object.entries(payload || {})
          .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs[0] : errs}`)
          .join(' | ') ||
        'Registration failed. Try again.'
      setServerError(message)
    }
  }

  if (success) {
    return (
      <div className={styles.page} style={{ justifyContent: 'center' }}>
        <div className={styles.successCard}>
          <FiCheckCircle size={48} color="var(--primary)" />
          <h2>Account created!</h2>
          <p>Redirecting you to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <div className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#007dfc" />
              <path d="M8 16L14 10L20 16L14 22L8 16Z" fill="white" />
              <path d="M16 16L22 10L28 16L22 22L16 16Z" fill="white" opacity="0.6" />
            </svg>
            <span className={styles.logoText}>SupplySphere</span>
          </div>

          <div className={styles.brandCopy}>
            <h1 className={styles.brandHeading}>
              Join the
              <br />
              network.
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
            ].map((feature) => (
              <div key={feature} className={styles.featureItem}>
                <span className={styles.featureDot} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formCard} style={{ maxWidth: 520 }}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Create your account</h2>
            <p className={styles.formSub}>Fill in your details to get started.</p>
          </div>

          {serverError && (
            <div className={styles.errorBanner}>
              <FiAlertCircle size={16} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
            <div className={styles.row2}>
              <Input
                label="Name"
                icon={FiUser}
                placeholder="Krish Shah"
                error={errors.name?.message}
                {...register('name', { required: 'Name is required' })}
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
                  message: 'Enter a valid email address',
                },
              })}
            />

            <div>
              <label className={styles.sectionLabel}>Select Role *</label>
              <div className={styles.roleGrid}>
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRoleId(role.id)
                      setValue('role_id', role.id, { shouldValidate: true })
                    }}
                    className={styles.roleCard}
                    style={{
                      borderColor: selectedRoleId === role.id ? 'var(--primary)' : 'var(--border)',
                      background: selectedRoleId === role.id ? 'rgba(0,125,252,0.06)' : 'var(--bg-white)',
                    }}
                  >
                    <span className={styles.roleLabel}>{role.label}</span>
                    <span className={styles.roleDesc}>{role.desc}</span>
                    {selectedRoleId === role.id && <span className={styles.roleCheck}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

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
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
            </div>

            <Button type="submit" loading={isSubmitting} disabled={!selectedRoleId}>
              Create Account
            </Button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.switchLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
