// MongoDB controller.
import { Workshop } from '../models/Workshop.js'
import { WorkshopEnrollment } from '../models/WorkshopEnrollment.js'
import { Notification } from '../models/Notification.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, pageMeta } from '../utils/pagination.js'

export async function listWorkshops(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  else filter.status = { $in: ['Open', 'Closed', 'Completed'] }
  if (req.query.skill) filter.skill = new RegExp(req.query.skill, 'i')
  if (req.query.upcoming === 'true') filter.startDate = { $gte: new Date() }
  const [workshops, total] = await Promise.all([
    Workshop.find(filter).populate('institution', 'name code').populate('createdBy', 'name').sort({ startDate: 1 }).skip(skip).limit(limit).lean(),
    Workshop.countDocuments(filter),
  ])
  res.json({ data: { workshops }, meta: pageMeta(total, page, limit) })
}

export async function createWorkshop(req, res) {
  const { institutionId, ...body } = req.validated.body
  const workshop = await Workshop.create({ ...body, institution: institutionId || req.user.institution, createdBy: req.user._id })
  res.status(201).json({ data: { workshop } })
}

export async function updateWorkshop(req, res) {
  const workshop = await Workshop.findById(req.validated.params.id)
  if (!workshop) throw new ApiError(404, 'Workshop was not found', 'WORKSHOP_NOT_FOUND')
  if (req.user.role !== 'admin' && !workshop.createdBy.equals(req.user._id)) {
    throw new ApiError(403, 'You can only update workshops you created', 'FORBIDDEN')
  }
  const { institutionId, ...body } = req.validated.body
  if (institutionId) workshop.institution = institutionId
  Object.assign(workshop, body)
  await workshop.save()
  res.json({ data: { workshop } })
}

export async function enroll(req, res) {
  const workshopId = req.validated.params.id
  if (await WorkshopEnrollment.exists({ workshop: workshopId, student: req.user._id })) {
    throw new ApiError(409, 'You are already enrolled in this workshop', 'ALREADY_ENROLLED')
  }
  const workshop = await Workshop.findOneAndUpdate(
    { _id: workshopId, status: 'Open', startDate: { $gte: new Date() }, $expr: { $lt: ['$enrolledCount', '$capacity'] } },
    { $inc: { enrolledCount: 1 } }, { new: true },
  )
  if (!workshop) throw new ApiError(409, 'This workshop is closed, full, or unavailable', 'WORKSHOP_UNAVAILABLE')
  try {
    const enrollment = await WorkshopEnrollment.create({ workshop: workshopId, student: req.user._id })
    await Notification.create({
      recipient: req.user._id, type: 'event', title: 'Workshop registration confirmed',
      message: `You are enrolled in ${workshop.name}.`, link: '/student/dashboard', metadata: { workshopId },
    })
    res.status(201).json({ data: { enrollment, workshop } })
  } catch (error) {
    await Workshop.updateOne({ _id: workshopId }, { $inc: { enrolledCount: -1 } })
    throw error
  }
}

export async function cancelEnrollment(req, res) {
  const enrollment = await WorkshopEnrollment.findOneAndDelete({ workshop: req.validated.params.id, student: req.user._id, status: 'Enrolled' })
  if (!enrollment) throw new ApiError(404, 'Active enrollment was not found', 'ENROLLMENT_NOT_FOUND')
  await Workshop.updateOne({ _id: enrollment.workshop, enrolledCount: { $gt: 0 } }, { $inc: { enrolledCount: -1 } })
  res.status(204).end()
}

export async function listMyEnrollments(req, res) {
  const enrollments = await WorkshopEnrollment.find({ student: req.user._id }).populate('workshop').sort({ createdAt: -1 })
  res.json({ data: { enrollments } })
}
