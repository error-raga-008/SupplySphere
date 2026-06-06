import React from 'react'
import { MdAdd, MdSearch } from 'react-icons/md'

export default function Vendors() {
  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--secondary)]">Vendors</h2>
          <p className="text-sm text-[var(--muted)] mt-1">Manage your supplier and vendor relationships</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search vendors..." 
              className="w-full bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[var(--radius-md)] pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all shadow-[var(--shadow-sm)]"
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-[var(--shadow-sm)] whitespace-nowrap">
            <MdAdd className="w-5 h-5" />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-[var(--bg-white)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] border border-[var(--border-light)] p-8 flex flex-col items-center justify-center flex-1 min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        <h3 className="text-lg font-bold text-[var(--secondary)] mb-1">No vendors found</h3>
        <p className="text-sm text-[var(--muted)] text-center max-w-md mb-6">
          You haven't added any vendors yet. Start by adding your first supplier to begin managing relationships.
        </p>
        <button className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border-light)] text-[var(--text-dark)] hover:text-[var(--primary)] px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold transition-colors">
          <MdAdd className="w-5 h-5" />
          Add Your First Vendor
        </button>
      </div>
    </div>
  )
}
