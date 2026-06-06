import React, { useState } from 'react'
import useAuth from '../hooks/useAuth'

export default function Settings() {
  const { user, login } = useAuth()
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    company: 'SupplySphere Inc.'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock updating the user in AuthContext
    login({ 
      access: localStorage.getItem('ss_access'), 
      refresh: localStorage.getItem('ss_refresh'), 
      user: { ...user, name: formData.name, email: formData.email, role: formData.role },
      permissions: JSON.parse(localStorage.getItem('ss_permissions') || '[]')
    })
    alert('Profile updated successfully!')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--secondary)]">Settings</h2>
          <p className="text-sm text-[var(--muted)]">Manage your personal profile and account preferences.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-white)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] border border-[var(--border-light)] overflow-hidden max-w-3xl">
        <div className="p-6 border-b border-[var(--border-light)] bg-[var(--bg)]">
          <h3 className="text-lg font-bold text-[var(--secondary)]">User Profile</h3>
          <p className="text-sm text-[var(--muted)]">Update your photo and personal details here.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--secondary)]">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--secondary)]">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="e.g. john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--secondary)]">Role</label>
              <input 
                type="text" 
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="e.g. Product Manager"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--secondary)]">Company</label>
              <input 
                type="text" 
                name="company"
                value={formData.company}
                onChange={handleChange}
                disabled
                className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border-light)] text-[var(--muted)] rounded-[var(--radius-md)] text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-light)] flex justify-end gap-3">
            <button type="button" className="px-4 py-2 bg-[var(--bg)] border border-[var(--border-light)] text-[var(--secondary)] rounded-[var(--radius-md)] text-sm font-bold hover:bg-[var(--border-light)] transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-white rounded-[var(--radius-md)] text-sm font-bold shadow-[var(--shadow-sm)] hover:bg-opacity-90 transition-colors">
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
