import React from 'react'
export default function Approvals(){
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Approvals</h2>
        <div className="flex gap-2">
          <input placeholder="Search" className="p-2 border rounded" />
          <button className="bg-blue-600 text-white p-2 rounded">Add Approval</button>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4">No approvals yet</div>
    </div>
  )
}
