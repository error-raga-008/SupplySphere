import React from 'react'

export default function Table({ columns = [], data = [] }) {
  return (
    <div className="bg-[var(--bg-white)] w-full">
      <table className="min-w-full divide-y divide-[var(--border-light)]">
        <thead className="bg-[var(--bg)]">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={col.accessor} 
                className={`px-6 py-4 text-left text-xs font-bold text-[var(--text)] uppercase tracking-wider ${idx === 0 ? 'rounded-tl-[var(--radius-lg)]' : ''} ${idx === columns.length - 1 ? 'rounded-tr-[var(--radius-lg)]' : ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-light)]">
          {data.map((row, idx) => (
            <tr 
              key={idx} 
              className="hover:bg-[var(--bg)] transition-colors duration-[var(--transition-sm)] group cursor-pointer"
            >
              {columns.map(col => (
                <td 
                  key={col.accessor} 
                  className="px-6 py-4 text-sm font-medium text-[var(--text-dark)] group-hover:text-[var(--primary)] transition-colors"
                >
                  {/* Quick format hack for statuses and amounts */}
                  {col.accessor === 'status' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e5f8ed] text-[#00b289]">
                      {row[col.accessor]}
                    </span>
                  ) : col.accessor.includes('amount') ? (
                    `$${row[col.accessor]}`
                  ) : (
                    row[col.accessor]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
