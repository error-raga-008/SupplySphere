import React, { useState } from 'react'
import Table from '../components/Table'
import { recentApprovals } from '../utils/mockData'

export default function Approvals() {
  const [approvals, setApprovals] = useState(recentApprovals)

  const handleApprove = (id) => {
    setApprovals(approvals.filter(a => a.id !== id))
  }

  const handleReject = (id) => {
    setApprovals(approvals.filter(a => a.id !== id))
  }

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Type', accessor: 'type' },
    { header: 'Reference', accessor: 'reference' },
    { header: 'Requester', accessor: 'requester' },
    { header: 'Amount', accessor: 'amount', render: (val) => `$${val.toLocaleString()}` },
    { header: 'Status', accessor: 'status', render: (val) => (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#f2a600] bg-opacity-20 text-[#f2a600]">
        {val.charAt(0).toUpperCase() + val.slice(1)}
      </span>
    )},
    { header: 'Actions', accessor: 'actions', render: (_, row) => (
      <div className="flex gap-2">
        <button 
          onClick={() => handleApprove(row.id)}
          className="bg-[#00b289] text-white px-3 py-1 rounded-[var(--radius-md)] text-xs font-bold hover:bg-opacity-90 transition-colors"
        >
          Approve
        </button>
        <button 
          onClick={() => handleReject(row.id)}
          className="bg-[#f23838] text-white px-3 py-1 rounded-[var(--radius-md)] text-xs font-bold hover:bg-opacity-90 transition-colors"
        >
          Reject
        </button>
      </div>
    )}
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--secondary)]">Pending Approvals</h2>
          <p className="text-sm text-[var(--muted)]">Review and approve purchase orders and quotations.</p>
        </div>
        <div className="flex gap-3">
          <input 
            placeholder="Search approvals..." 
            className="px-4 py-2 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" 
          />
        </div>
      </div>

      <div className="bg-[var(--bg-white)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] border border-[var(--border-light)]">
        <Table columns={columns} data={approvals} />
      </div>
    </div>
  )
}
