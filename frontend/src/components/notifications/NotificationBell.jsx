import React, { forwardRef } from 'react'
import { HiOutlineBell } from 'react-icons/hi'
import useNotifications from '../../hooks/useNotifications'
import { formatBadgeCount } from '../../utils/notificationUtils'

const NotificationBell = forwardRef(function NotificationBell(_, ref) {
  const { unreadCount, isPanelOpen, togglePanel } = useNotifications()
  const badge = formatBadgeCount(unreadCount)

  return (
    <button
      ref={ref}
      type="button"
      onClick={togglePanel}
      aria-label={
        badge
          ? `Notifications, ${unreadCount} unread`
          : 'Notifications'
      }
      aria-expanded={isPanelOpen}
      aria-haspopup="dialog"
      className={[
        'relative p-2 rounded-lg transition-colors',
        'text-[var(--text-dark)] hover:bg-gray-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
        isPanelOpen ? 'bg-gray-100' : '',
      ].join(' ')}
    >
      <HiOutlineBell className="w-5 h-5" aria-hidden="true" />
      {badge && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none"
          aria-hidden="true"
        >
          {badge}
        </span>
      )}
    </button>
  )
})

export default NotificationBell
