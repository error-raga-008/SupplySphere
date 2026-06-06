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
  { invoice_number: 'INV-001', vendor: 'Acme Supplies', total_amount: 4500, amount_due: 1500 },
]
