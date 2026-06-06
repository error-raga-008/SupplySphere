import React from 'react'
import {
  formatNotificationType,
  formatRelativeTime,
  getNotificationIcon,
} from '../../utils/notificationUtils'

export default function NotificationCard({ notification, onSelect }) {
  const { id, type, title, message, is_read, created_at } = notification
  const icon = getNotificationIcon(type)

  const handleClick = () => {
    onSelect(notification)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(notification)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${is_read ? '' : 'Unread: '}${title}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={[
        'w-full text-left p-4 border-b border-[var(--border-light)] cursor-pointer transition-colors',
        'hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-inset',
        is_read
          ? 'bg-white'
          : 'bg-blue-50/60 border-l-[3px] border-l-[var(--primary)]',
      ].join(' ')}
    >
      <div className="flex gap-3">
        <div
          className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0"
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={[
                'text-sm leading-snug text-[var(--text-dark)]',
                is_read ? 'font-medium' : 'font-semibold',
              ].join(' ')}
            >
              {title}
            </h4>
            {!is_read && (
              <span
                className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 mt-1.5"
                aria-hidden="true"
              />
            )}
          </div>
          <p className="text-sm text-[var(--text)] mt-1 line-clamp-2">{message}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium text-[var(--primary)] bg-blue-50 px-2 py-0.5 rounded-full">
              {formatNotificationType(type)}
            </span>
            <time
              className="text-xs text-[var(--muted)]"
              dateTime={created_at}
            >
              {formatRelativeTime(created_at)}
            </time>
          </div>
        </div>
      </div>
    </div>
  )
}
