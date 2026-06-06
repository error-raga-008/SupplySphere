import React from 'react'
import {
  FiFileText, FiClock, FiUsers, FiShoppingCart, FiDollarSign, FiTrendingUp,
} from 'react-icons/fi'
import Card from '../components/Card'
import Table from '../components/Table'
import { dashboardMock, recentRFQs, recentQuotations, recentPOs, recentInvoices } from '../utils/mockData'

const CARD_META = [
  { key: 'active_rfqs',           title: 'Active RFQs',        icon: FiFileText,    color: '#007dfc' },
  { key: 'pending_approvals',     title: 'Pending Approvals',  icon: FiClock,       color: '#d97706' },
  { key: 'total_vendors',         title: 'Total Vendors',      icon: FiUsers,       color: '#059669' },
  { key: 'active_purchase_orders',title: 'Active POs',         icon: FiShoppingCart,color: '#7c3aed' },
  { key: 'open_invoices',         title: 'Open Invoices',      icon: FiDollarSign,  color: '#0891b2' },
  { key: 'monthly_spend',         title: 'Monthly Spend',      icon: FiTrendingUp,  color: '#dc2626',
    format: v => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
]

const rfqCols = [
  { header: 'RFQ #',    accessor: 'rfq_number' },
  { header: 'Title',    accessor: 'title' },
  { header: 'Status',   accessor: 'status' },
]
const quoteCols = [
  { header: 'Quote #',  accessor: 'quote_number' },
  { header: 'Vendor',   accessor: 'vendor' },
  { header: 'Amount',   accessor: 'total_amount' },
  { header: 'Status',   accessor: 'status' },
]
const poCols = [
  { header: 'PO #',     accessor: 'po_number' },
  { header: 'Vendor',   accessor: 'vendor' },
  { header: 'Amount',   accessor: 'total_amount' },
]
const invCols = [
  { header: 'Invoice #',accessor: 'invoice_number' },
  { header: 'Vendor',   accessor: 'vendor' },
  { header: 'Amount Due',accessor: 'amount_due' },
]

function SectionHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-dark)', fontFamily: 'var(--font)' }}>
        {title}
      </h2>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontFamily: 'var(--font)' }}>

      {/* Stats Grid */}
      <div>
        <SectionHeader title="Overview" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {CARD_META.map(({ key, title, icon, color, format }) => (
            <Card
              key={key}
              title={title}
              value={format ? format(dashboardMock[key]) : dashboardMock[key]}
              icon={icon}
              color={color}
            />
          ))}
        </div>
      </div>

      {/* Recent RFQs + Quotations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <SectionHeader title="Recent RFQs" />
          <Table columns={rfqCols} data={recentRFQs} />
        </div>
        <div>
          <SectionHeader title="Recent Quotations" />
          <Table columns={quoteCols} data={recentQuotations} />
        </div>
      </div>

      {/* Recent POs + Invoices */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <SectionHeader title="Recent Purchase Orders" />
          <Table columns={poCols} data={recentPOs} />
        </div>
        <div>
          <SectionHeader title="Recent Invoices" />
          <Table columns={invCols} data={recentInvoices} />
        </div>
      </div>

    </div>
  )
}
