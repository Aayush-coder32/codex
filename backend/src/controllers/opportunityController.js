import { Opportunity } from '../models/Opportunity.js'
import { Company } from '../models/Company.js'
import { SavedOpportunity } from '../models/SavedOpportunity.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, pageMeta } from '../utils/pagination.js'

function buildFilter(query, includePrivate = false) {
  const filter = includePrivate ? {} : { status: 'Active', deadline: { $gte: new Date() } }
  if (query.q) filter.$text = { $search: query.q }
  if (query.type) filter.type = query.type
  if (query.mode) filter.mode = query.mode
  if (query.location) filter.location = new RegExp(query.location, 'i')
  if (query.skill) filter.skills = new RegExp(`^${query.skill}$`, 'i')
  if (includePrivate && query.status) filter.status = query.status
  return filter
}

const sortFor = (sort) => sort === 'deadline' ? { deadline: 1 } : sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 }

export async function listOpportunities(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const filter = buildFilter(req.validated?.query || req.query)
  const [opportunities, total] = await Promise.all([
    Opportunity.find(filter).populate('company', 'name slug logoUrl verified industry').sort(sortFor(req.query.sort)).skip(skip).limit(limit).lean(),
    Opportunity.countDocuments(filter),
  ])
  res.json({ data: { opportunities }, meta: pageMeta(total, page, limit) })
}

export async function getOpportunity(req, res) {
  const opportunity = await Opportunity.findOne({ _id: req.params.id, status: 'Active' }).populate('company', 'name slug logoUrl verified industry about website')
  if (!opportunity) throw new ApiError(404, 'Opportunity was not found', 'OPPORTUNITY_NOT_FOUND')
  await Opportunity.updateOne({ _id: opportunity._id }, { $inc: { 'stats.views': 1 } })
  res.json({ data: { opportunity } })
}

export async function listMyOpportunities(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const filter = { ...buildFilter(req.validated?.query || req.query, true), createdBy: req.user._id }
  const [opportunities, total] = await Promise.all([
    Opportunity.find(filter).populate('company', 'name slug logoUrl verified').sort(sortFor(req.query.sort)).skip(skip).limit(limit).lean(),
    Opportunity.countDocuments(filter),
  ])
  res.json({ data: { opportunities }, meta: pageMeta(total, page, limit) })
}

export async function createOpportunity(req, res) {
  const body = { ...req.validated.body }
  const companyId = req.user.role === 'admin' ? body.companyId : req.user.company
  delete body.companyId
  if (!companyId || !(await Company.exists({ _id: companyId, isActive: true }))) {
    throw new ApiError(422, 'A valid company is required', 'COMPANY_REQUIRED')
  }
  const opportunity = await Opportunity.create({
    ...body, company: companyId, createdBy: req.user._id,
    publishedAt: body.status === 'Active' ? new Date() : undefined,
  })
  await opportunity.populate('company', 'name slug logoUrl verified')
  res.status(201).json({ data: { opportunity } })
}

export async function updateOpportunity(req, res) {
  const opportunity = await Opportunity.findById(req.validated.params.id)
  if (!opportunity) throw new ApiError(404, 'Opportunity was not found', 'OPPORTUNITY_NOT_FOUND')
  if (req.user.role !== 'admin' && !opportunity.createdBy.equals(req.user._id)) {
    throw new ApiError(403, 'You can only update your own opportunities', 'FORBIDDEN')
  }
  const body = { ...req.validated.body }
  if (req.user.role === 'admin' && body.companyId) opportunity.company = body.companyId
  delete body.companyId
  if (body.status === 'Active' && opportunity.status !== 'Active') opportunity.publishedAt = new Date()
  Object.assign(opportunity, body)
  await opportunity.save()
  await opportunity.populate('company', 'name slug logoUrl verified')
  res.json({ data: { opportunity } })
}

export async function deleteOpportunity(req, res) {
  const opportunity = await Opportunity.findById(req.validated.params.id)
  if (!opportunity) throw new ApiError(404, 'Opportunity was not found', 'OPPORTUNITY_NOT_FOUND')
  if (req.user.role !== 'admin' && !opportunity.createdBy.equals(req.user._id)) {
    throw new ApiError(403, 'You can only archive your own opportunities', 'FORBIDDEN')
  }
  opportunity.status = 'Archived'
  await opportunity.save()
  res.status(204).end()
}

export async function listSaved(req, res) {
  const saved = await SavedOpportunity.find({ user: req.user._id })
    .populate({ path: 'opportunity', populate: { path: 'company', select: 'name slug logoUrl verified' } })
    .sort({ createdAt: -1 })
  res.json({ data: { opportunities: saved.map((item) => item.opportunity).filter(Boolean) } })
}

export async function toggleSaved(req, res) {
  const opportunityId = req.validated.params.id
  if (!(await Opportunity.exists({ _id: opportunityId, status: 'Active' }))) {
    throw new ApiError(404, 'Opportunity was not found', 'OPPORTUNITY_NOT_FOUND')
  }
  const existing = await SavedOpportunity.findOne({ user: req.user._id, opportunity: opportunityId })
  if (existing) {
    await existing.deleteOne()
    return res.json({ data: { saved: false } })
  }
  await SavedOpportunity.create({ user: req.user._id, opportunity: opportunityId })
  res.status(201).json({ data: { saved: true } })
}
