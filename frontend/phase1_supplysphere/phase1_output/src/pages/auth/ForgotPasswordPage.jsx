import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiMail, FiAlertCircle, FiCheckCircle, FiArrowLeft } from 'react-icons/fi'
import { authService } from '../../services/authService'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import styles from './Auth.module.css'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  async function onSubmit({ email }) {
    setServerError('')
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Something went wrong. Try again.')
    }
  }

  return (
    <div className={styles.page} style={{ justifyContent: 'center', background: 'var(--bg)' }}>
      <div className={styles.formCard} style={{ maxWidth: 440, width: '100%' }}>
        {sent ? (
          <div className={styles.centeredBlock}>
            <FiCheckCircle size={48} color="var(--primary)" />
            <h2 className={styles.formTitle} style={{ marginTop: 16 }}>Check your email</h2>
            <p className={styles.formSub} style={{ textAlign: 'center' }}>
              We've sent password reset instructions to your email address.
            </p>
            <Link to="/login" className={styles.switchLink} style={{ marginTop: 24, display: 'inline-block' }}>
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.logo} style={{ marginBottom: 24 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#007dfc"/>
                <path d="M8 16L14 10L20 16L14 22L8 16Z" fill="white"/>
                <path d="M16 16L22 10L28 16L22 22L16 16Z" fill="white" opacity="0.6"/>
              </svg>
              <span className={styles.logoText}>SupplySphere</span>
            </div>

            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Reset password</h2>
              <p className={styles.formSub}>Enter your email and we'll send you a reset link</p>
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

              <Button type="submit" loading={isSubmitting}>
                Send Reset Link
              </Button>
            </form>

            <p className={styles.switchText}>
              <Link to="/login" className={styles.switchLink}>
                <FiArrowLeft size={14} style={{ display: 'inline', marginRight: 4 }} />
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
