const TYPE_ICONS = {
  rfq: '📄',
  quotation: '💰',
  'purchase order': '📦',
  purchase_order: '📦',
  invoice: '🧾',
  vendor: '🏢',
  approval: '✅',
  system: '⚙️',
  user: '👤',
}

export function getNotificationIcon(type) {
  if (!type) return '🔔'
  const key = type.toLowerCase().replace(/\s+/g, '_')
  return TYPE_ICONS[key] || TYPE_ICONS[type.toLowerCase()] || '🔔'
}

export function formatNotificationType(type) {
  if (!type) return 'System'
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatRelativeTime(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export function formatBadgeCount(count) {
  if (count <= 0) return null
  if (count > 99) return '99+'
  return String(count)
}
