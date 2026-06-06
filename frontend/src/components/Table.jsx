import React from 'react'

export default function Table({ columns = [], data = [] }) {
  return (
    <div className="bg-white rounded shadow-sm overflow-auto">
      <table className="min-w-full divide-y">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={col.accessor} className="px-4 py-2 text-left text-sm font-medium text-gray-700">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t">
              {columns.map(col => (
                <td key={col.accessor} className="px-4 py-2 text-sm">{row[col.accessor]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
