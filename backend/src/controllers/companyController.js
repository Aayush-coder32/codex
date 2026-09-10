// MongoDB controller.
import { Company } from '../models/Company.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, pageMeta } from '../utils/pagination.js'

export async function listCompanies(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const filter = { isActive: true }
  if (req.query.q) filter.$text = { $search: req.query.q }
  const [companies, total] = await Promise.all([
    Company.find(filter).sort({ verified: -1, name: 1 }).skip(skip).limit(limit).lean(),
    Company.countDocuments(filter),
  ])
  res.json({ data: { companies }, meta: pageMeta(total, page, limit) })
}

export async function getCompany(req, res) {
  const company = await Company.findById(req.params.id)
  if (!company || !company.isActive) throw new ApiError(404, 'Company was not found', 'COMPANY_NOT_FOUND')
  res.json({ data: { company } })
}

export async function getMyCompany(req, res) {
  const company = await Company.findById(req.user.company)
  if (!company) throw new ApiError(404, 'Company profile was not found', 'COMPANY_NOT_FOUND')
  res.json({ data: { company } })
}

export async function updateMyCompany(req, res) {
  const company = await Company.findByIdAndUpdate(req.user.company, { $set: req.validated.body }, { new: true, runValidators: true })
  if (!company) throw new ApiError(404, 'Company profile was not found', 'COMPANY_NOT_FOUND')
  res.json({ data: { company } })
}
