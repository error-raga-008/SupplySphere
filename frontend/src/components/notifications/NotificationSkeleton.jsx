import React from 'react'

function SkeletonCard() {
  return (
    <div className="p-4 border-b border-[var(--border-light)] animate-pulse">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

export default function NotificationSkeleton({ count = 5 }) {
  return (
    <div role="status" aria-label="Loading notifications">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
      <span className="sr-only">Loading notifications...</span>
    </div>
  )
}
