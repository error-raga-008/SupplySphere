import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi'
import useAuth from '../hooks/useAuth'
import * as authService from '../services/authService'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import styles from './auth/Auth.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { login: setSession } = useAuth()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  async function onSubmit({ email, password }) {
    setServerError('')
    try {
      const response = await authService.login({ email, password })
      setSession(response.data)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const message = error.response?.data?.detail || error.response?.data?.message
      setServerError(message || 'Invalid email or password.')
    }
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
              Procurement,
              <br />
              simplified.
            </h1>
            <p className={styles.brandSub}>
              Manage vendors, RFQs, approvals, and invoices in one place.
            </p>
          </div>

          <div className={styles.brandStats}>
            {[
              { label: 'Active Vendors', value: '2.4k+' },
              { label: 'Orders Processed', value: '$3.1M+' },
              { label: 'Avg. Approval Time', value: '< 2hrs' },
            ].map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSub}>Sign in to continue to your workspace.</p>
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
            Don&apos;t have an account?{' '}
            <Link to="/register" className={styles.switchLink}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
