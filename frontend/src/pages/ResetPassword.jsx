import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiLock, FiKey, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import * as authService from '../services/authService'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import styles from './auth/Auth.module.css'

export default function ResetPassword() {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const password = watch('password')

  async function onSubmit(data) {
    setServerError('')
    try {
      await authService.resetPassword({ token: data.token, password: data.password })
      setSuccess(true)
    } catch (error) {
      setServerError(error.response?.data?.detail || 'Password reset failed.')
    }
  }

  return (
    <div className={styles.page} style={{ justifyContent: 'center', background: 'var(--bg)' }}>
      <div className={styles.formCard} style={{ maxWidth: 440, width: '100%' }}>
        {success ? (
          <div className={styles.centeredBlock}>
            <FiCheckCircle size={48} color="var(--primary)" />
            <h2 className={styles.formTitle} style={{ marginTop: 16 }}>Password updated</h2>
            <p className={styles.formSub} style={{ textAlign: 'center' }}>
              Your password has been reset successfully.
            </p>
            <Link to="/login" className={styles.switchLink} style={{ marginTop: 24, display: 'inline-block' }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.logo} style={{ marginBottom: 24 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="#007dfc" />
                <path d="M8 16L14 10L20 16L14 22L8 16Z" fill="white" />
                <path d="M16 16L22 10L28 16L22 22L16 16Z" fill="white" opacity="0.6" />
              </svg>
              <span className={styles.logoText}>SupplySphere</span>
            </div>

            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Set a new password</h2>
              <p className={styles.formSub}>Enter the reset token and choose a new password.</p>
            </div>

            {serverError && (
              <div className={styles.errorBanner}>
                <FiAlertCircle size={16} />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
              <Input
                label="Token"
                icon={FiKey}
                placeholder="Paste reset token"
                error={errors.token?.message}
                {...register('token', { required: 'Reset token is required' })}
              />

              <Input
                label="New Password"
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
                error={errors.confirm?.message}
                {...register('confirm', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords must match',
                })}
              />

              <Button type="submit" loading={isSubmitting}>
                Reset Password
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
