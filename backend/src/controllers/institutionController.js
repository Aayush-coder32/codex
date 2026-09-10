// MongoDB controller.
import { Institution } from '../models/Institution.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, pageMeta } from '../utils/pagination.js'

export async function listInstitutions(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const filter = req.user?.role === 'admin' ? {} : { isActive: true }
  if (req.query.q) filter.$text = { $search: req.query.q }
  if (req.query.state) filter.state = new RegExp(req.query.state, 'i')
  const [institutions, total] = await Promise.all([
    Institution.find(filter).sort({ verified: -1, name: 1 }).skip(skip).limit(limit).lean(),
    Institution.countDocuments(filter),
  ])
  res.json({ data: { institutions }, meta: pageMeta(total, page, limit) })
}

export async function createInstitution(req, res) {
  const institution = await Institution.create(req.validated.body)
  res.status(201).json({ data: { institution } })
}

export async function updateInstitution(req, res) {
  const institution = await Institution.findByIdAndUpdate(req.validated.params.id, { $set: req.validated.body }, { new: true, runValidators: true })
  if (!institution) throw new ApiError(404, 'Institution was not found', 'INSTITUTION_NOT_FOUND')
  res.json({ data: { institution } })
}
