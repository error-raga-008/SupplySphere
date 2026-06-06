import React, { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineRefresh } from 'react-icons/hi'
import useNotifications from '../../hooks/useNotifications'
import NotificationCard from './NotificationCard'
import NotificationSkeleton from './NotificationSkeleton'

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function NotificationPanel({ bellRef }) {
  const navigate = useNavigate()
  const panelRef = useRef(null)
  const {
    notifications,
    unreadCount,
    isPanelOpen,
    isLoading,
    error,
    closePanel,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  const handleSelect = useCallback(
    async (notification) => {
      if (!notification.is_read) {
        await markAsRead(notification.id)
      }
      if (notification.link) {
        closePanel()
        navigate(notification.link)
      }
    },
    [markAsRead, closePanel, navigate]
  )

  const handleMarkAllRead = useCallback(async () => {
    if (unreadCount === 0) return
    await markAllAsRead()
  }, [markAllAsRead, unreadCount])

  useEffect(() => {
    if (!isPanelOpen) return undefined

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closePanel()
        bellRef?.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isPanelOpen, closePanel, bellRef])

  useEffect(() => {
    if (!isPanelOpen) return undefined

    const handleClickOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !bellRef?.current?.contains(e.target)
      ) {
        closePanel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isPanelOpen, closePanel, bellRef])

  useEffect(() => {
    if (!isPanelOpen || !panelRef.current) return

    const focusable = panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
    if (focusable.length > 0) {
      focusable[0].focus()
    }

    const handleTabTrap = (e) => {
      if (e.key !== 'Tab' || !panelRef.current) return

      const elements = panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      if (elements.length === 0) return

      const first = elements[0]
      const last = elements[elements.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleTabTrap)
    return () => document.removeEventListener('keydown', handleTabTrap)
  }, [isPanelOpen, isLoading, error, notifications.length])

  return (
    <>
      <div
        className={[
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-250 md:hidden',
          isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden="true"
        onClick={closePanel}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications panel"
        className={[
          'fixed z-50 flex flex-col bg-white shadow-2xl',
          'top-[57px] right-0 h-[75vh]',
          'w-full sm:w-[320px] md:w-[400px]',
          'rounded-l-[var(--radius-lg)] md:rounded-[var(--radius-lg)] md:mr-4',
          'border border-[var(--border-light)]',
          'transition-transform duration-250 ease-out',
          isPanelOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none',
        ].join(' ')}
        style={{ transitionDuration: '250ms' }}
      >
        <header className="shrink-0 px-4 py-4 border-b border-[var(--border-light)] bg-white rounded-t-[var(--radius-lg)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-dark)]">
                Notifications
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || isLoading}
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              Mark All Read
            </button>
            <button
              type="button"
              onClick={refreshNotifications}
              disabled={isLoading}
              aria-label="Refresh notifications"
              className="text-xs font-medium px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--text-dark)] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <HiOutlineRefresh
                className={['w-3.5 h-3.5', isLoading ? 'animate-spin' : ''].join(' ')}
                aria-hidden="true"
              />
              Refresh
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {isLoading && notifications.length === 0 && <NotificationSkeleton />}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <p className="text-sm text-[var(--text)] mb-4">{error}</p>
              <button
                type="button"
                onClick={refreshNotifications}
                className="text-sm font-medium px-4 py-2 rounded-md bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                Retry
              </button>
            </div>
          )}

          {!error && !isLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <span className="text-4xl mb-3" aria-hidden="true">
                🔔
              </span>
              <p className="text-sm text-[var(--muted)]">No notifications available</p>
            </div>
          )}

          {!error && notifications.length > 0 && (
            <div role="list" aria-label="Notification list">
              {notifications.map((notification) => (
                <div key={notification.id} role="listitem">
                  <NotificationCard
                    notification={notification}
                    onSelect={handleSelect}
                  />
                </div>
              ))}
            </div>
          )}

          {isLoading && notifications.length > 0 && (
            <div className="py-3 text-center">
              <span className="text-xs text-[var(--muted)]">Refreshing...</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
