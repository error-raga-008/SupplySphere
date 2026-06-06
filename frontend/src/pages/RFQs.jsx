import React from 'react'
export default function RFQs(){
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">RFQs</h2>
        <div className="flex gap-2">
          <input placeholder="Search" className="p-2 border rounded" />
          <button className="bg-blue-600 text-white p-2 rounded">Add RFQ</button>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4">No RFQs yet</div>
    </div>
  )
}
