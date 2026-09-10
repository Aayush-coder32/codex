// MongoDB controller.
import { Application } from '../models/Application.js'
import { Opportunity } from '../models/Opportunity.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { Notification } from '../models/Notification.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, pageMeta } from '../utils/pagination.js'

const allowedTransitions = {
  Applied: ['Under Review', 'Shortlisted', 'Rejected'],
  'Under Review': ['Shortlisted', 'Interview', 'Rejected'],
  Shortlisted: ['Interview', 'Selected', 'Rejected'],
  Interview: ['Selected', 'Rejected'],
  Selected: [], Rejected: [], Withdrawn: [],
}

function scoreMatch(profile, opportunity) {
  const studentSkills = new Set((profile?.skills || []).map((skill) => skill.name.toLowerCase()))
  const required = opportunity.skills.map((skill) => skill.toLowerCase())
  if (!required.length) return 0
  return Math.round(required.filter((skill) => studentSkills.has(skill)).length / required.length * 100)
}

export async function apply(req, res) {
  const { opportunityId, coverLetter } = req.validated.body
  const opportunity = await Opportunity.findOne({ _id: opportunityId, status: 'Active', deadline: { $gte: new Date() } })
  if (!opportunity) throw new ApiError(404, 'This opportunity is unavailable or closed', 'OPPORTUNITY_UNAVAILABLE')
  if (await Application.exists({ opportunity: opportunityId, student: req.user._id })) {
    throw new ApiError(409, 'You have already applied to this opportunity', 'ALREADY_APPLIED')
  }

  const profile = await StudentProfile.findOne({ user: req.user._id })
  const application = await Application.create({
    opportunity: opportunityId,
    student: req.user._id,
    coverLetter,
    matchScore: scoreMatch(profile, opportunity),
    resumeSnapshot: profile?.resume?.originalName ? { originalName: profile.resume.originalName, uploadedAt: profile.resume.uploadedAt } : undefined,
    history: [{ status: 'Applied', changedBy: req.user._id }],
  })
  await Promise.all([
    Opportunity.updateOne({ _id: opportunityId }, { $inc: { 'stats.applications': 1 } }),
    Notification.create({
      recipient: opportunity.createdBy, type: 'opportunity', title: 'New application received',
      message: `${req.user.name} applied for ${opportunity.title}.`, link: `/company/applications`,
      metadata: { applicationId: application._id, opportunityId },
    }),
  ])
  await application.populate({ path: 'opportunity', populate: { path: 'company', select: 'name logoUrl' } })
  res.status(201).json({ data: { application } })
}

export async function listMine(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const filter = { student: req.user._id }
  if (req.query.status) filter.status = req.query.status
  const [applications, total] = await Promise.all([
    Application.find(filter).populate({ path: 'opportunity', populate: { path: 'company', select: 'name slug logoUrl' } }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Application.countDocuments(filter),
  ])
  res.json({ data: { applications }, meta: pageMeta(total, page, limit) })
}

export async function withdraw(req, res) {
  const application = await Application.findOne({ _id: req.validated.params.id, student: req.user._id })
  if (!application) throw new ApiError(404, 'Application was not found', 'APPLICATION_NOT_FOUND')
  if (['Selected', 'Rejected', 'Withdrawn'].includes(application.status)) {
    throw new ApiError(409, 'This application can no longer be withdrawn', 'INVALID_STATUS_TRANSITION')
  }
  application.status = 'Withdrawn'
  application.history.push({ status: 'Withdrawn', changedBy: req.user._id })
  await application.save()
  res.json({ data: { application } })
}

export async function listApplicants(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const opportunityFilter = req.user.role === 'admin' ? {} : { createdBy: req.user._id }
  if (req.query.opportunityId) opportunityFilter._id = req.query.opportunityId
  const opportunityIds = await Opportunity.find(opportunityFilter).distinct('_id')
  const filter = { opportunity: { $in: opportunityIds } }
  if (req.query.status) filter.status = req.query.status
  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('student', 'name email avatarUrl institution')
      .populate({ path: 'opportunity', select: 'title company', populate: { path: 'company', select: 'name' } })
      .sort({ matchScore: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Application.countDocuments(filter),
  ])
  const profileByUser = new Map((await StudentProfile.find({ user: { $in: applications.map((item) => item.student?._id).filter(Boolean) } })
    .select('user college branch graduationYear skills readiness').lean()).map((profile) => [String(profile.user), profile]))
  const enriched = applications.map((item) => ({ ...item, profile: profileByUser.get(String(item.student?._id)) || null }))
  res.json({ data: { applications: enriched }, meta: pageMeta(total, page, limit) })
}

export async function updateStatus(req, res) {
  const application = await Application.findById(req.validated.params.id).populate('opportunity')
  if (!application) throw new ApiError(404, 'Application was not found', 'APPLICATION_NOT_FOUND')
  if (req.user.role !== 'admin' && !application.opportunity.createdBy.equals(req.user._id)) {
    throw new ApiError(403, 'You can only manage applicants for your opportunities', 'FORBIDDEN')
  }
  const { status, note } = req.validated.body
  if (!allowedTransitions[application.status]?.includes(status)) {
    throw new ApiError(409, `Cannot move an application from ${application.status} to ${status}`, 'INVALID_STATUS_TRANSITION')
  }
  application.status = status
  application.history.push({ status, note, changedBy: req.user._id })
  await application.save()
  await Notification.create({
    recipient: application.student, type: status === 'Rejected' ? 'warning' : 'success', title: 'Application status updated',
    message: `Your application for ${application.opportunity.title} is now ${status}.`,
    link: '/student/applications', metadata: { applicationId: application._id },
  })
  res.json({ data: { application } })
}
