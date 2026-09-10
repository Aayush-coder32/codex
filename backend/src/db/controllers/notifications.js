import { query } from '../../config/database.js'
import { mapNotification } from '../records.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPagination, pageMeta } from '../../utils/pagination.js'

export async function listNotifications(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const unreadSql = req.query.unread === 'true' ? ' AND read_at IS NULL' : ''
  const [records, count, unread] = await Promise.all([
    query(`SELECT * FROM notifications WHERE recipient_id = $1${unreadSql} ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [req.user.id, limit, skip]),
    query(`SELECT COUNT(*)::int AS total FROM notifications WHERE recipient_id = $1${unreadSql}`, [req.user.id]),
    query('SELECT COUNT(*)::int AS total FROM notifications WHERE recipient_id = $1 AND read_at IS NULL', [req.user.id]),
  ])
  res.json({ data: { notifications: records.rows.map(mapNotification), unread: unread.rows[0].total }, meta: pageMeta(count.rows[0].total, page, limit) })
}

export async function markRead(req, res) {
  const row = (await query(
    'UPDATE notifications SET read_at = NOW() WHERE id = $1 AND recipient_id = $2 RETURNING *',
    [req.validated.params.id, req.user.id],
  )).rows[0]
  if (!row) throw new ApiError(404, 'Notification was not found', 'NOTIFICATION_NOT_FOUND')
  res.json({ data: { notification: mapNotification(row) } })
}

export async function markAllRead(req, res) {
  const result = await query('UPDATE notifications SET read_at = NOW() WHERE recipient_id = $1 AND read_at IS NULL', [req.user.id])
  res.json({ data: { updated: result.rowCount } })
}

export async function deleteNotification(req, res) {
  const result = await query('DELETE FROM notifications WHERE id = $1 AND recipient_id = $2 RETURNING id', [req.validated.params.id, req.user.id])
  if (!result.rowCount) throw new ApiError(404, 'Notification was not found', 'NOTIFICATION_NOT_FOUND')
  res.status(204).end()
}
