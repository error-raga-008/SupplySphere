import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import styles from './Auth.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  async function onSubmit({ email, password }) {
    setServerError('')
    try {
      const user = await login(email, password)
      // Role-based redirect
      const routes = {
        admin: '/dashboard',
        procurement_officer: '/dashboard',
        manager: '/dashboard',
        vendor: '/dashboard',
      }
      navigate(routes[user.role] || '/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message
      setServerError(msg || 'Invalid email or password.')
    }
  }

  return (
    <div className={styles.page}>
      {/* Left panel – branding */}
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
              Procurement,<br />simplified.
            </h1>
            <p className={styles.brandSub}>
              Manage vendors, RFQs, approvals, and invoices — all in one place.
            </p>
          </div>

          <div className={styles.brandStats}>
            {[
              { label: 'Active Vendors', value: '2.4k+' },
              { label: 'Orders Processed', value: '$3.1M+' },
              { label: 'Avg. Approval Time', value: '< 2hrs' },
            ].map(s => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSub}>Sign in to your account to continue</p>
          </div>

          {serverError && (
            <div className={styles.errorBanner}>
              <FiAlertCircle size={16} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
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

            <Input
              label="Password"
              type="password"
              icon={FiLock}
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              })}
            />

            <div className={styles.forgotRow}>
              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={isSubmitting}>
              Sign In
            </Button>
          </form>

          <p className={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.switchLink}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
