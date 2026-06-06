import Card from '../components/Card'
import Table from '../components/Table'
import { dashboardMock, recentRFQs, recentQuotations, recentPOs, recentInvoices } from '../utils/mockData'

export default function Dashboard() {
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
    <div className="min-h-screen bg-slate-50 p-6 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Procurement Dashboard</h1>
        <p className="text-sm text-slate-500">Monitor active workflows, track vendor communications, and overview recent actions.</p>
      </div>

      {/* Metrics Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card title="Active RFQs" value={dashboardMock.active_rfqs} />
        <Card title="Pending Approvals" value={dashboardMock.pending_approvals} />
        <Card title="Total Vendors" value={dashboardMock.total_vendors} />
      </div>

      {/* Metrics Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card title="Active POs" value={dashboardMock.active_purchase_orders} />
        <Card title="Open Invoices" value={dashboardMock.open_invoices} />
        <Card title="Monthly Spend" value={`$${dashboardMock.monthly_spend}`} />
      </div>

      {/* Tables Section 1: RFQs & Quotations */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent RFQs</h3>
            <p className="text-xs text-slate-500">Latest requests for quotations dispatched to suppliers.</p>
          </div>
          <div className="overflow-x-auto">
            <Table columns={rfqCols} data={recentRFQs} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Quotations</h3>
            <p className="text-xs text-slate-500">Bids and pricing proposals received from incoming vendors.</p>
          </div>
          <div className="overflow-x-auto">
            <Table columns={quoteCols} data={recentQuotations} />
          </div>
        </div>
      </div>

      {/* Tables Section 2: Purchase Orders & Invoices */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Purchase Orders</h3>
            <p className="text-xs text-slate-500">Confirmed financial documents issued to vendors.</p>
          </div>
          <div className="overflow-x-auto">
            <Table columns={poCols} data={recentPOs} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Invoices</h3>
            <p className="text-xs text-slate-500">Incoming payment items matching executed purchase orders.</p>
          </div>
          <div className="overflow-x-auto">
            <Table columns={invCols} data={recentInvoices} />
          </div>
        </div>
      </div>
    </div>
  )
}