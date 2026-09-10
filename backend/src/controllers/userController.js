import fs from 'node:fs/promises'
import { User } from '../models/User.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, pageMeta } from '../utils/pagination.js'
import { publicUser } from '../utils/serializers.js'

export async function updateMe(req, res) {
  Object.assign(req.user, req.validated.body)
  await req.user.save()
  res.json({ data: { user: publicUser(req.user) } })
}

export async function updateSettings(req, res) {
  const incoming = req.validated.body
  if (incoming.timezone !== undefined) req.user.settings.timezone = incoming.timezone
  if (incoming.language !== undefined) req.user.settings.language = incoming.language
  if (incoming.theme !== undefined) req.user.settings.theme = incoming.theme
  if (incoming.notifications) Object.assign(req.user.settings.notifications, incoming.notifications)
  await req.user.save()
  res.json({ data: { settings: req.user.settings } })
}

export async function getMyProfile(req, res) {
  const profile = await StudentProfile.findOne({ user: req.user._id }).populate('user', 'name email avatarUrl')
  if (!profile) throw new ApiError(404, 'Student profile was not found', 'PROFILE_NOT_FOUND')
  res.json({ data: { profile } })
}

export async function updateMyProfile(req, res) {
  const profile = await StudentProfile.findOneAndUpdate(
    { user: req.user._id }, { $set: req.validated.body }, { new: true, runValidators: true, upsert: true },
  ).populate('user', 'name email avatarUrl')
  res.json({ data: { profile } })
}

export async function addProject(req, res) {
  const profile = await StudentProfile.findOne({ user: req.user._id })
  if (!profile) throw new ApiError(404, 'Student profile was not found', 'PROFILE_NOT_FOUND')
  profile.projects.unshift(req.validated.body)
  await profile.save()
  res.status(201).json({ data: { project: profile.projects[0] } })
}

export async function updateProject(req, res) {
  const profile = await StudentProfile.findOne({ user: req.user._id })
  const project = profile?.projects.id(req.validated.params.id)
  if (!project) throw new ApiError(404, 'Project was not found', 'PROJECT_NOT_FOUND')
  Object.assign(project, req.validated.body)
  await profile.save()
  res.json({ data: { project } })
}

export async function deleteProject(req, res) {
  const profile = await StudentProfile.findOne({ user: req.user._id })
  const project = profile?.projects.id(req.validated.params.id)
  if (!project) throw new ApiError(404, 'Project was not found', 'PROJECT_NOT_FOUND')
  project.deleteOne()
  await profile.save()
  res.status(204).end()
}

export async function addCertificate(req, res) {
  const profile = await StudentProfile.findOne({ user: req.user._id })
  if (!profile) throw new ApiError(404, 'Student profile was not found', 'PROFILE_NOT_FOUND')
  profile.certificates.unshift(req.validated.body)
  await profile.save()
  res.status(201).json({ data: { certificate: profile.certificates[0] } })
}

export async function updateCertificate(req, res) {
  const profile = await StudentProfile.findOne({ user: req.user._id })
  const certificate = profile?.certificates.id(req.validated.params.id)
  if (!certificate) throw new ApiError(404, 'Certificate was not found', 'CERTIFICATE_NOT_FOUND')
  Object.assign(certificate, req.validated.body)
  await profile.save()
  res.json({ data: { certificate } })
}

export async function deleteCertificate(req, res) {
  const profile = await StudentProfile.findOne({ user: req.user._id })
  const certificate = profile?.certificates.id(req.validated.params.id)
  if (!certificate) throw new ApiError(404, 'Certificate was not found', 'CERTIFICATE_NOT_FOUND')
  certificate.deleteOne()
  await profile.save()
  res.status(204).end()
}

export async function uploadResume(req, res) {
  if (!req.file) throw new ApiError(400, 'A PDF resume is required', 'RESUME_REQUIRED')
  const profile = await StudentProfile.findOne({ user: req.user._id }).select('+resume.path')
  if (!profile) throw new ApiError(404, 'Student profile was not found', 'PROFILE_NOT_FOUND')
  const previousPath = profile.resume?.path
  profile.resume = {
    path: req.file.path, originalName: req.file.originalname, mimeType: req.file.mimetype,
    size: req.file.size, uploadedAt: new Date(),
  }
  await profile.save()
  if (previousPath) await fs.unlink(previousPath).catch(() => {})
  res.status(201).json({ data: { resume: { ...profile.resume.toObject(), path: undefined } } })
}

export async function downloadResume(req, res) {
  const profile = await StudentProfile.findOne({ user: req.user._id }).select('+resume.path')
  if (!profile?.resume?.path) throw new ApiError(404, 'No resume has been uploaded', 'RESUME_NOT_FOUND')
  res.download(profile.resume.path, profile.resume.originalName)
}

export async function listStudents(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const filter = {}
  if (req.query.skill) filter['skills.name'] = new RegExp(req.query.skill, 'i')
  if (req.query.graduationYear) filter.graduationYear = Number(req.query.graduationYear)
  if (req.query.q) filter.$text = { $search: req.query.q }
  const [students, total] = await Promise.all([
    StudentProfile.find(filter).populate('user', 'name email avatarUrl institution').skip(skip).limit(limit).sort({ readiness: -1 }).lean(),
    StudentProfile.countDocuments(filter),
  ])
  res.json({ data: { students }, meta: pageMeta(total, page, limit) })
}

export async function getStudent(req, res) {
  const profile = await StudentProfile.findById(req.params.id).populate('user', 'name email avatarUrl institution')
  if (!profile) throw new ApiError(404, 'Student profile was not found', 'PROFILE_NOT_FOUND')
  res.json({ data: { profile } })
}
