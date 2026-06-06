import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useAuth from '../hooks/useAuth'
import * as notificationService from '../services/notificationService'

const NotificationContext = createContext(null)

const REFRESH_INTERVAL_MS = 30_000

function normalizeNotifications(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchInFlight = useRef(false)

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  )

  const fetchNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!isAuthenticated || fetchInFlight.current) return

    fetchInFlight.current = true
    if (!silent) setIsLoading(true)
    setError(null)

    try {
      const { data } = await notificationService.listNotifications()
      setNotifications(normalizeNotifications(data))
    } catch {
      if (!silent) setError('Unable to load notifications.')
    } finally {
      fetchInFlight.current = false
      if (!silent) setIsLoading(false)
    }
  }, [isAuthenticated])

  const openPanel = useCallback(() => setIsPanelOpen(true), [])
  const closePanel = useCallback(() => setIsPanelOpen(false), [])

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev)
  }, [])

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )

    try {
      await notificationService.markAsRead(id)
    } catch {
      await fetchNotifications({ silent: true })
    }
  }, [fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))

    try {
      await notificationService.markAllAsRead()
    } catch {
      await fetchNotifications({ silent: true })
    }
  }, [fetchNotifications])

  const refreshNotifications = useCallback(() => {
    return fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      setIsPanelOpen(false)
      setError(null)
      return
    }

    fetchNotifications({ silent: true })
  }, [isAuthenticated, fetchNotifications])

  useEffect(() => {
    if (!isAuthenticated) return undefined

    const intervalId = setInterval(() => {
      fetchNotifications({ silent: true })
    }, REFRESH_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [isAuthenticated, fetchNotifications])

  useEffect(() => {
    if (isPanelOpen && isAuthenticated) {
      fetchNotifications()
    }
  }, [isPanelOpen, isAuthenticated, fetchNotifications])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isPanelOpen,
      isLoading,
      error,
      openPanel,
      closePanel,
      togglePanel,
      fetchNotifications,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [
      notifications,
      unreadCount,
      isPanelOpen,
      isLoading,
      error,
      openPanel,
      closePanel,
      togglePanel,
      fetchNotifications,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
    ]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
