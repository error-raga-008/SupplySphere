import React from 'react'
export default function Vendors(){
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Vendors</h2>
        <div className="flex gap-2">
          <input placeholder="Search" className="p-2 border rounded" />
          <button className="bg-blue-600 text-white p-2 rounded">Add Vendor</button>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4">No vendors yet</div>
    </div>
  )
}
