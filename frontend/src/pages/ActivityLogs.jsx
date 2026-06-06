import React from 'react'
export default function ActivityLogs(){
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Activity Logs</h2>
        <div className="flex gap-2">
          <input placeholder="Search" className="p-2 border rounded" />
        </div>
      </div>
      <div className="bg-white rounded shadow p-4">No activity logs yet</div>
    </div>
  )
}
