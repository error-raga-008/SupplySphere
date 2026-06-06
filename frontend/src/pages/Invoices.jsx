import React, { useState } from 'react'
import Table from '../components/Table'
import { recentInvoices } from '../utils/mockData'

export default function Invoices() {
  const [invoices, setInvoices] = useState(recentInvoices)

  const handlePay = (id) => {
    setInvoices(invoices.map(inv => inv.invoice_number === id ? { ...inv, status: 'paid', amount_due: 0 } : inv))
  }

  const columns = [
    { header: 'Invoice Number', accessor: 'invoice_number' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Total Amount', accessor: 'total_amount', render: (val) => `$${val.toLocaleString()}` },
    { header: 'Amount Due', accessor: 'amount_due', render: (val) => `$${val.toLocaleString()}` },
    { header: 'Status', accessor: 'status', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${val === 'paid' ? 'bg-[#00b289] bg-opacity-20 text-[#00b289]' : 'bg-[#f2a600] bg-opacity-20 text-[#f2a600]'}`}>
        {val.charAt(0).toUpperCase() + val.slice(1)}
      </span>
    )},
    { header: 'Actions', accessor: 'actions', render: (_, row) => (
      <div className="flex gap-2">
        {row.status !== 'paid' && (
          <button 
            onClick={() => handlePay(row.invoice_number)}
            className="bg-[var(--primary)] text-white px-3 py-1 rounded-[var(--radius-md)] text-xs font-bold hover:bg-opacity-90 transition-colors"
          >
            Pay Now
          </button>
        )}
        <button className="bg-[var(--bg)] text-[var(--secondary)] border border-[var(--border-light)] px-3 py-1 rounded-[var(--radius-md)] text-xs font-bold hover:bg-[var(--border-light)] transition-colors">
          View
        </button>
      </div>
    )}
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--secondary)]">Invoices</h2>
          <p className="text-sm text-[var(--muted)]">Manage and pay vendor invoices.</p>
        </div>
        <div className="flex gap-3">
          <input 
            placeholder="Search invoices..." 
            className="px-4 py-2 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" 
          />
          <button className="bg-[var(--primary)] text-white px-4 py-2 rounded-[var(--radius-md)] text-sm font-bold shadow-[var(--shadow-sm)]">
            + New Invoice
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-white)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] border border-[var(--border-light)]">
        <Table columns={columns} data={invoices} />
      </div>
    </div>
  )
}
