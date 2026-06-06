import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import Table from '../components/Table'
import { dashboardMock, recentPOs, recentInvoices } from '../utils/mockData'

const weeklyData = [
  { name: 'Mo', value: 40 },
  { name: 'Tu', value: 30 },
  { name: 'We', value: 20 },
  { name: 'Th', value: 27 },
  { name: 'Fr', value: 18 },
  { name: 'Sa', value: 23 },
  { name: 'Su', value: 34 },
];

const profitData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
  { name: 'Apr', value: 450 },
  { name: 'May', value: 700 },
  { name: 'Jun', value: 550 },
];

// Base Card Wrapper
const Card = ({ title, subtitle, children, className = "", action, noPadding = false }) => (
  <div className={`bg-[var(--bg-white)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] border border-[var(--border-light)] flex flex-col ${noPadding ? '' : 'p-5'} ${className}`}>
    {(title || action) && (
      <div className={`flex justify-between items-start mb-4 ${noPadding ? 'p-5 pb-0' : ''}`}>
        <div>
          {title && <h3 className="text-lg font-bold text-[var(--secondary)]">{title}</h3>}
          {subtitle && <p className="text-sm text-[var(--muted)]">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="flex-1 flex flex-col">
      {children}
    </div>
  </div>
);

export default function Dashboard() {
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

  // Custom styled Tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--secondary-dark)] text-white text-xs px-3 py-2 rounded-lg shadow-[var(--shadow-md)]">
          <p className="font-semibold">{`${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-4 items-center">
        <button className="bg-[var(--primary)] text-white px-4 py-2 rounded-[var(--radius-md)] text-sm font-bold shadow-[var(--shadow-sm)]">
          + Create PO
        </button>
        <button className="bg-[var(--secondary)] text-white px-4 py-2 rounded-[var(--radius-md)] text-sm font-bold shadow-[var(--shadow-sm)]">
          + New RFQ
        </button>
        <button className="bg-[var(--bg-white)] border border-[var(--border-light)] text-[var(--text-dark)] px-4 py-2 rounded-[var(--radius-md)] text-sm font-bold shadow-[var(--shadow-sm)]">
          + Add Vendor
        </button>
      </div>

      {/* Top Row: Welcome + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Welcome Card */}
        <div className="lg:col-span-1 bg-[var(--bg-white)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] border border-[var(--border-light)] p-6 relative overflow-hidden flex flex-col justify-between group">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-[var(--secondary)] mb-1">Congratulations Admin! 🎉</h2>
            <p className="text-sm text-[var(--text)] mb-4">Best supply chain manager of the month</p>
            <div className="mt-2">
              <h3 className="text-3xl font-bold text-[var(--primary)]">$42.8k</h3>
              <p className="text-sm text-[var(--text)] mt-1 font-medium">78% of target 🚀</p>
            </div>
            <button className="mt-5 bg-[var(--primary)] bg-opacity-10 text-white hover:bg-[blue] hover:cursor-pointer text-[var(--primary)] px-4 py-2 rounded-[var(--radius-md)] text-sm font-bold">
              View Sales
            </button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 text-[var(--primary)] w-32 h-32 -mr-6 -mb-6">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19,5h-2V3H7v2H5C3.9,5,3,5.9,3,7v1c0,2.55,1.92,4.63,4.39,4.94C8.23,14.54,9.6,15.68,11,15.93V19H7v2h10v-2h-4v-3.07 c1.4-0.25,2.77-1.39,3.61-3.01C19.08,12.63,21,10.55,21,8V7C21,5.9,20.1,5,19,5z M5,8V7h2v3.82C5.84,10.4,5,9.3,5,8z M19,8 c0,1.3-0.84,2.4-2,2.82V7h2V8z" /></svg>
          </div>
        </div>

        {/* Transactions / Key Metrics */}
        <Card className="lg:col-span-2" title="Procurement Overview" subtitle="Core activities at a glance" action={<button className="text-[var(--muted)] hover:text-[var(--primary)]">...</button>}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 h-full items-center pt-2">

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-18 h-12 rounded-xl bg-[#45a1ff] bg-opacity-10 text-[var(--primary)] flex items-center justify-center shadow-sm">
                <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 2.8 2.8" xml:space="preserve"><g fill="none" stroke="#000" stroke-width=".087" stroke-miterlimit="10"><path d="m.958.219 1.448 1.448-.914.914L.044 1.133V.219Z"/><path d="m1.308.219 1.448 1.448-.914.914M.831.787a.22.22 0 0 1-.219.219.22.22 0 0 1-.218-.219.219.219 0 0 1 .437 0z"/></g></svg>
              </div>
              <div>
                <p className="text-xs text-[var(--text)] uppercase tracking-wider font-semibold mb-0.5">Pending Approvals</p>
                <p className="text-xl font-bold text-[var(--secondary)]">{dashboardMock.pending_approvals}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#00b289] bg-opacity-10 text-[#00b289] flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <div>
                <p className="text-xs text-[var(--text)] uppercase tracking-wider font-semibold mb-0.5">Active RFQs</p>
                <p className="text-xl font-bold text-[var(--secondary)]">{dashboardMock.active_rfqs}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#f2a600] bg-opacity-10 text-[#f2a600] flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              </div>
              <div>
                <p className="text-xs text-[var(--text)] uppercase tracking-wider font-semibold mb-0.5">Active POs</p>
                <p className="text-xl font-bold text-[var(--secondary)]">{dashboardMock.active_purchase_orders}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)] bg-opacity-30 text-[var(--secondary)] flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p className="text-xs text-[var(--text)] uppercase tracking-wider font-semibold mb-0.5">Invoices</p>
                <p className="text-xl font-bold text-[var(--secondary)]">{dashboardMock.open_invoices}</p>
              </div>
            </div>

          </div>
        </Card>
      </div>

      {/* Middle Row: Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weekly Overview */}
        <Card className="lg:col-span-2" title="Weekly Spend Overview" action={<button className="text-[var(--muted)] hover:text-[var(--primary)]">...</button>}>
          <div className="h-[250px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 13 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 13 }} />
                <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} content={<CustomTooltip />} />
                <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Total Profit + Stats Grid */}
        <div className="flex flex-col gap-6">
          <Card title="Monthly Spend tracking" subtitle="Total Spend" action={<button className="text-[var(--muted)] hover:text-[var(--primary)]">...</button>}>
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-2xl font-bold text-[var(--secondary)]">${dashboardMock.monthly_spend}</h2>
              <span className="text-sm font-semibold text-[#00b289]">-12%</span>
            </div>
            <div className="h-[100px] w-full -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitData}>
                  <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-6 flex-1">
            <Card className="justify-center items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--secondary)] mb-1">45</h3>
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Vendors</p>
            </Card>
            <Card className="justify-center items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-[#00b289] bg-opacity-10 text-[#00b289] flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--secondary)] mb-1">$88k</h3>
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Savings</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Row: Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
        <Card title="Recent Purchase Orders" noPadding action={<button className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">View All</button>}>
          <Table columns={poCols} data={recentPOs} />
        </Card>

        <Card title="Recent Invoices" noPadding action={<button className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">View All</button>}>
          <Table columns={invCols} data={recentInvoices} />
        </Card>
      </div>

    </div>
  )
}