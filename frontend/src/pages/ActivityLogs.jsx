import React from 'react'
import { activityLogs } from '../utils/mockData'
import { MdHistory } from 'react-icons/md'

export default function ActivityLogs() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--secondary)]">Activity Logs</h2>
          <p className="text-sm text-[var(--muted)]">Track system events and user actions.</p>
        </div>
        <div className="flex gap-3">
          <input 
            placeholder="Search logs..." 
            className="px-4 py-2 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" 
          />
        </div>
      </div>

      <div className="bg-[var(--bg-white)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] border border-[var(--border-light)] p-6">
        <div className="space-y-6">
          {activityLogs.map((log, index) => (
            <div key={log.id} className="flex gap-4 relative">
              {index !== activityLogs.length - 1 && (
                <div className="absolute left-6 top-10 bottom-[-24px] w-px bg-[var(--border-light)]"></div>
              )}
              
              <div className="w-12 h-12 rounded-full bg-[var(--bg)] border border-[var(--border-light)] flex items-center justify-center text-[var(--primary)] flex-shrink-0 z-10">
                <MdHistory className="w-6 h-6" />
              </div>
              
              <div className="flex-1 bg-[var(--bg)] rounded-[var(--radius-md)] p-4 border border-[var(--border-light)]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                  <h3 className="text-sm font-bold text-[var(--secondary)]">{log.action}</h3>
                  <span className="text-xs font-semibold text-[var(--muted)] bg-[var(--bg-white)] px-2 py-1 rounded-full border border-[var(--border-light)]">
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-sm text-[var(--text)] mb-2">{log.details}</p>
                <div className="text-xs font-medium text-[var(--primary)] bg-[var(--primary)] bg-opacity-10 inline-block px-2 py-1 rounded-md">
                  User: {log.user}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

