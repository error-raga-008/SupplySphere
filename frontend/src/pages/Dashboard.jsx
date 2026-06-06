import React from 'react'
import Card from '../components/Card'
import Table from '../components/Table'
import { dashboardMock, recentRFQs, recentQuotations, recentPOs, recentInvoices } from '../utils/mockData'

export default function Dashboard(){
  const rfqCols = [
    { header: 'RFQ Number', accessor: 'rfq_number' },
    { header: 'Title', accessor: 'title' },
    { header: 'Status', accessor: 'status' },
  ]

  const quoteCols = [
    { header: 'Quote Number', accessor: 'quote_number' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Amount', accessor: 'total_amount' },
  ]

  const poCols = [
    { header: 'PO Number', accessor: 'po_number' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Amount', accessor: 'total_amount' },
  ]

  const invCols = [
    { header: 'Invoice Number', accessor: 'invoice_number' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Amount Due', accessor: 'amount_due' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card title="Active RFQs" value={dashboardMock.active_rfqs} />
        <Card title="Pending Approvals" value={dashboardMock.pending_approvals} />
        <Card title="Total Vendors" value={dashboardMock.total_vendors} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card title="Active POs" value={dashboardMock.active_purchase_orders} />
        <Card title="Open Invoices" value={dashboardMock.open_invoices} />
        <Card title="Monthly Spend" value={`$${dashboardMock.monthly_spend}`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="mb-2 font-semibold">Recent RFQs</h3>
          <Table columns={rfqCols} data={recentRFQs} />
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Recent Quotations</h3>
          <Table columns={quoteCols} data={recentQuotations} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="mb-2 font-semibold">Recent Purchase Orders</h3>
          <Table columns={poCols} data={recentPOs} />
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Recent Invoices</h3>
          <Table columns={invCols} data={recentInvoices} />
        </div>
      </div>
    </div>
  )
}
