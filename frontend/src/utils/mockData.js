export const dashboardMock = {
  active_rfqs: 12,
  pending_approvals: 3,
  total_vendors: 45,
  active_purchase_orders: 8,
  open_invoices: 5,
  monthly_spend: 123456.78,
}

export const recentRFQs = [
  { rfq_number: 'RFQ-001', title: 'Office Chairs', status: 'published', submission_deadline: '2026-07-01', created_by: 'Alice' },
  { rfq_number: 'RFQ-002', title: 'Laptops', status: 'draft', submission_deadline: '2026-07-10', created_by: 'Bob' },
]

export const recentQuotations = [
  { quote_number: 'Q-100', vendor: 'Acme Supplies', total_amount: 5000, status: 'submitted' },
]

export const recentPOs = [
  { po_number: 'PO-001', vendor: 'Acme Supplies', total_amount: 4500 },
]

export const recentInvoices = [
  { invoice_number: 'INV-001', vendor: 'Acme Supplies', total_amount: 4500, amount_due: 1500, status: 'pending' },
  { invoice_number: 'INV-002', vendor: 'Global Tech', total_amount: 12000, amount_due: 0, status: 'paid' },
]

export const recentApprovals = [
  { id: 'APP-001', type: 'Purchase Order', reference: 'PO-045', requester: 'Bob Smith', amount: 8500, status: 'pending' },
  { id: 'APP-002', type: 'Quotation', reference: 'Q-100', requester: 'Alice Johnson', amount: 5000, status: 'pending' },
]

export const activityLogs = [
  { id: 1, action: 'User Login', user: 'Admin', timestamp: '2026-06-06 08:30 AM', details: 'Logged in from 192.168.1.1' },
  { id: 2, action: 'Created PO', user: 'Bob Smith', timestamp: '2026-06-06 09:15 AM', details: 'Created PO-045 for Global Tech' },
  { id: 3, action: 'Approved Quotation', user: 'Admin', timestamp: '2026-06-06 10:45 AM', details: 'Approved Q-099 from Acme Supplies' },
  { id: 4, action: 'Updated Settings', user: 'Admin', timestamp: '2026-06-06 11:20 AM', details: 'Changed notification preferences' },
]
