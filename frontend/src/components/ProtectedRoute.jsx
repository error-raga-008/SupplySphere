import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function ProtectedRoute({ children, requiredPermissions = [] }) {
  const { isAuthenticated, hasAnyPermission } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasAnyPermission(requiredPermissions)) return <Navigate to="/dashboard" replace />
  return children
}
