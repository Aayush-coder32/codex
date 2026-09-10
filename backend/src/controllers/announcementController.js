// MongoDB controller.
import { Announcement } from '../models/Announcement.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, pageMeta } from '../utils/pagination.js'

const audienceForRole = { student: 'students', faculty: 'faculty', company: 'companies', admin: 'everyone' }

async function listWithFilter(req, res, filter) {
  const { page, limit, skip } = getPagination(req.query)
  const [announcements, total] = await Promise.all([
    Announcement.find(filter).populate('author', 'name role').sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Announcement.countDocuments(filter),
  ])
  res.json({ data: { announcements }, meta: pageMeta(total, page, limit) })
}

export async function listPublic(req, res) {
  const now = new Date()
  return listWithFilter(req, res, { status: 'Published', audience: 'everyone', $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] })
}

export async function listFeed(req, res) {
  const now = new Date()
  const audiences = req.user.role === 'admin' ? undefined : ['everyone', audienceForRole[req.user.role]]
  return listWithFilter(req, res, {
    status: 'Published', ...(audiences ? { audience: { $in: audiences } } : {}),
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  })
}

export async function listAll(req, res) {
  const filter = req.query.status ? { status: req.query.status } : {}
  return listWithFilter(req, res, filter)
}

export async function createAnnouncement(req, res) {
  const body = req.validated.body
  const announcement = await Announcement.create({
    ...body, author: req.user._id,
    publishedAt: body.status === 'Published' ? new Date() : undefined,
  })
  res.status(201).json({ data: { announcement } })
}

export async function updateAnnouncement(req, res) {
  const announcement = await Announcement.findById(req.validated.params.id)
  if (!announcement) throw new ApiError(404, 'Announcement was not found', 'ANNOUNCEMENT_NOT_FOUND')
  if (req.validated.body.status === 'Published' && announcement.status !== 'Published') announcement.publishedAt = new Date()
  Object.assign(announcement, req.validated.body)
  await announcement.save()
  res.json({ data: { announcement } })
}

export async function deleteAnnouncement(req, res) {
  const announcement = await Announcement.findByIdAndDelete(req.validated.params.id)
  if (!announcement) throw new ApiError(404, 'Announcement was not found', 'ANNOUNCEMENT_NOT_FOUND')
  res.status(204).end()
}
