import { Notification } from '../models/Notification.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, pageMeta } from '../utils/pagination.js'

export async function listNotifications(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const filter = { recipient: req.user._id }
  if (req.query.unread === 'true') filter.readAt = null
  const [notifications, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user._id, readAt: null }),
  ])
  res.json({ data: { notifications, unread }, meta: pageMeta(total, page, limit) })
}

export async function markRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.validated.params.id, recipient: req.user._id }, { readAt: new Date() }, { new: true },
  )
  if (!notification) throw new ApiError(404, 'Notification was not found', 'NOTIFICATION_NOT_FOUND')
  res.json({ data: { notification } })
}

export async function markAllRead(req, res) {
  const result = await Notification.updateMany({ recipient: req.user._id, readAt: null }, { readAt: new Date() })
  res.json({ data: { updated: result.modifiedCount } })
}

export async function deleteNotification(req, res) {
  const notification = await Notification.findOneAndDelete({ _id: req.validated.params.id, recipient: req.user._id })
  if (!notification) throw new ApiError(404, 'Notification was not found', 'NOTIFICATION_NOT_FOUND')
  res.status(204).end()
}
