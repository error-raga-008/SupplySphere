// ── Vendor categories ─────────────────────────────────────────────────────
export const vendorCategoriesMock = [
  { id: 1, name: 'Constructions' },
  { id: 2, name: 'IT' },
  { id: 3, name: 'Logistics' },
  { id: 4, name: 'Security' },
  { id: 5, name: 'Packaging' },
  { id: 6, name: 'Healthcare' },
  { id: 7, name: 'Furniture' },
  { id: 8, name: 'Electrical' },
]

// ── Vendors ───────────────────────────────────────────────────────────────
export const vendorsMock = [
  {
    id: 1,
    name: 'Infra Supplies Pvt Ltd',
    category: 'Constructions', category_id: 1,
    contact_person: 'Rajesh Mehta',
    email: 'rajesh@infrasupplies.in', phone: '+91 98765 43210',
    address: '45, Industrial Estate, Andheri East',
    city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400069',
    gst_number: '27AABCS1429Bz0', pan_number: 'AABCS1429B',
    bank_name: 'HDFC Bank', bank_account_no: '50200012345678', bank_ifsc: 'HDFC0001234',
    status: 'active', rating: 4.5, created_at: '2025-03-12T09:00:00Z',
  },
  {
    id: 2,
    name: 'Tech Core LTD',
    category: 'IT', category_id: 2,
    contact_person: 'Priya Sharma',
    email: 'priya@techcore.io', phone: '+91 91234 56789',
    address: 'B-204, Cyber City',
    city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500081',
    gst_number: '27AABCS1429Bz0', pan_number: 'AABCT5432C',
    bank_name: 'ICICI Bank', bank_account_no: '00201012345678', bank_ifsc: 'ICIC0001234',
    status: 'active', rating: 4.8, created_at: '2025-04-01T11:30:00Z',
  },
  {
    id: 3,
    name: 'FastLog Transport',
    category: 'Logistics', category_id: 3,
    contact_person: 'Ankit Patel',
    email: 'ankit@fastlog.co.in', phone: '+91 99876 54321',
    address: '12, Warehouse District',
    city: 'Ahmedabad', state: 'Gujarat', country: 'India', pincode: '380001',
    gst_number: '27AABCS1429Bz0', pan_number: 'AABCF1234F',
    bank_name: 'SBI', bank_account_no: '31287654321', bank_ifsc: 'SBIN0001234',
    status: 'blocked', rating: 2.1, created_at: '2025-02-20T08:45:00Z',
  },
  {
    id: 4,
    name: 'GreenBuild Materials',
    category: 'Constructions', category_id: 1,
    contact_person: 'Sunita Joshi',
    email: 'sunita@greenbuild.in', phone: '+91 87654 32109',
    address: '89, Sector 21',
    city: 'Noida', state: 'Uttar Pradesh', country: 'India', pincode: '201301',
    gst_number: '09AABCG5678Az0', pan_number: 'AABCG5678A',
    bank_name: 'Axis Bank', bank_account_no: '91709012345678', bank_ifsc: 'UTIB0001234',
    status: 'pending', rating: null, created_at: '2026-05-15T10:00:00Z',
  },
  {
    id: 5,
    name: 'CloudNet Solutions',
    category: 'IT', category_id: 2,
    contact_person: 'Vikram Singh',
    email: 'vikram@cloudnet.in', phone: '+91 96543 21098',
    address: '303, Prestige Tech Park',
    city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560103',
    gst_number: '29AABCC9012Bz0', pan_number: 'AABCC9012B',
    bank_name: 'Kotak Mahindra Bank', bank_account_no: '7712345678', bank_ifsc: 'KKBK0001234',
    status: 'active', rating: 4.2, created_at: '2025-11-08T14:20:00Z',
  },
  {
    id: 6,
    name: 'SafeGuard Security',
    category: 'Security', category_id: 4,
    contact_person: 'Mohan Kumar',
    email: 'mohan@safeguard.in', phone: '+91 94321 09876',
    address: '56, Defence Colony',
    city: 'New Delhi', state: 'Delhi', country: 'India', pincode: '110024',
    gst_number: '07AABCS3456Bz0', pan_number: 'AABCS3456B',
    bank_name: 'Punjab National Bank', bank_account_no: '0124000112345678', bank_ifsc: 'PUNB0001234',
    status: 'pending', rating: null, created_at: '2026-05-28T09:15:00Z',
  },
  {
    id: 7,
    name: 'SwiftCargo Express',
    category: 'Logistics', category_id: 3,
    contact_person: 'Deepak Rao',
    email: 'deepak@swiftcargo.in', phone: '+91 93210 98765',
    address: 'Plot 78, MIDC',
    city: 'Pune', state: 'Maharashtra', country: 'India', pincode: '411018',
    gst_number: '27AABCS7890Az0', pan_number: 'AABCS7890A',
    bank_name: 'Bank of Baroda', bank_account_no: '61550100012345', bank_ifsc: 'BARB0001234',
    status: 'blocked', rating: 1.8, created_at: '2025-06-10T16:00:00Z',
  },
  {
    id: 8,
    name: 'FreshPack Industries',
    category: 'Packaging', category_id: 5,
    contact_person: 'Kavita Nair',
    email: 'kavita@freshpack.in', phone: '+91 88765 43210',
    address: '23, Industrial Area, Phase II',
    city: 'Chandigarh', state: 'Punjab', country: 'India', pincode: '160002',
    gst_number: '03AABCF2345Bz0', pan_number: 'AABCF2345B',
    bank_name: 'HDFC Bank', bank_account_no: '50200098765432', bank_ifsc: 'HDFC0005678',
    status: 'active', rating: 3.9, created_at: '2025-09-22T12:00:00Z',
  },
  {
    id: 9,
    name: 'Medi Pharma Supplies',
    category: 'Healthcare', category_id: 6,
    contact_person: 'Dr. Ravi Gupta',
    email: 'ravi@medipharma.in', phone: '+91 79876 54321',
    address: '101, Medical Hub',
    city: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600030',
    gst_number: '33AABCM6789Bz0', pan_number: 'AABCM6789B',
    bank_name: 'Canara Bank', bank_account_no: '30191234567', bank_ifsc: 'CNRB0001234',
    status: 'active', rating: 4.6, created_at: '2025-07-03T08:00:00Z',
  },
  {
    id: 10,
    name: 'OfficeZone Furniture',
    category: 'Furniture', category_id: 7,
    contact_person: 'Neha Bansal',
    email: 'neha@officezone.in', phone: '+91 85432 10987',
    address: '67, Furniture Market',
    city: 'Jaipur', state: 'Rajasthan', country: 'India', pincode: '302001',
    gst_number: '08AABCO3456Bz0', pan_number: 'AABCO3456B',
    bank_name: 'Union Bank of India', bank_account_no: '510101234567890', bank_ifsc: 'UBIN0001234',
    status: 'pending', rating: null, created_at: '2026-06-01T11:00:00Z',
  },
  {
    id: 11,
    name: 'PowerGrid Electricals',
    category: 'Electrical', category_id: 8,
    contact_person: 'Sanjay Verma',
    email: 'sanjay@powergrid.in', phone: '+91 92109 87654',
    address: '14, Electronics Complex',
    city: 'Surat', state: 'Gujarat', country: 'India', pincode: '395010',
    gst_number: '24AABCP7890Az0', pan_number: 'AABCP7890A',
    bank_name: 'ICICI Bank', bank_account_no: '00271234567890', bank_ifsc: 'ICIC0005678',
    status: 'active', rating: 4.0, created_at: '2025-10-15T10:30:00Z',
  },
]

// ── Dashboard ─────────────────────────────────────────────────────────────
export const dashboardMock = {
  active_rfqs: 12,
  pending_approvals: 3,
  total_vendors: 45,
  active_purchase_orders: 8,
  open_invoices: 5,
  monthly_spend: 123456.78,
}

// ── Recent activity (dashboard tables) ───────────────────────────────────
export const recentRFQs = [
  { rfq_number: 'RFQ-001', title: 'Office Chairs', status: 'published', submission_deadline: '2026-07-01', created_by: 'Alice' },
  { rfq_number: 'RFQ-002', title: 'Laptops',       status: 'draft',     submission_deadline: '2026-07-10', created_by: 'Bob' },
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
