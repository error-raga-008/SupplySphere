import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Vendors from './pages/Vendors'
import RFQs from './pages/RFQs'
import Quotations from './pages/Quotations'
import Approvals from './pages/Approvals'
import PurchaseOrders from './pages/PurchaseOrders'
import Invoices from './pages/Invoices'
import ActivityLogs from './pages/ActivityLogs'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<ProtectedRoute requiredPermissions={['view_dashboard']}><Dashboard /></ProtectedRoute>} />
          <Route path="vendors" element={<ProtectedRoute requiredPermissions={['manage_vendors']}><Vendors /></ProtectedRoute>} />
          <Route path="rfqs" element={<ProtectedRoute requiredPermissions={['view_rfq']}><RFQs /></ProtectedRoute>} />
          <Route path="quotations" element={<ProtectedRoute requiredPermissions={['view_rfq', 'submit_quote']}><Quotations /></ProtectedRoute>} />
          <Route path="approvals" element={<ProtectedRoute requiredPermissions={['approve_quote', 'approve_po']}><Approvals /></ProtectedRoute>} />
          <Route path="purchase-orders" element={<ProtectedRoute requiredPermissions={['create_po', 'approve_po']}><PurchaseOrders /></ProtectedRoute>} />
          <Route path="invoices" element={<ProtectedRoute requiredPermissions={['view_invoices']}><Invoices /></ProtectedRoute>} />
          <Route path="activity-logs" element={<ProtectedRoute requiredPermissions={['manage_users', 'system_admin']}><ActivityLogs /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute requiredPermissions={['view_dashboard']}><Reports /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute requiredPermissions={['system_admin']}><Settings /></ProtectedRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

