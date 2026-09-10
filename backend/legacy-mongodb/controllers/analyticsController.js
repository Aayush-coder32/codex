import { User } from '../models/User.js'
import { Company } from '../models/Company.js'
import { Institution } from '../models/Institution.js'
import { Opportunity } from '../models/Opportunity.js'
import { Application } from '../models/Application.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { Workshop } from '../models/Workshop.js'

async function adminOverview(res) {
  const [students, institutions, companies, activeOpportunities, applications, placements, workshops] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }), Institution.countDocuments({ isActive: true }),
    Company.countDocuments({ isActive: true }), Opportunity.countDocuments({ status: 'Active' }), Application.countDocuments(),
    Application.countDocuments({ status: 'Selected' }), Workshop.countDocuments(),
  ])
  const placementRate = applications ? Math.round(placements / applications * 100) : 0
  res.json({ data: { role: 'admin', metrics: { students, institutions, companies, activeOpportunities, applications, placements, placementRate, workshops } } })
}

async function companyOverview(req, res) {
  const opportunityIds = await Opportunity.find({ createdBy: req.user._id }).distinct('_id')
  const [opportunities, activeOpportunities, applications, shortlisted, selected] = await Promise.all([
    Opportunity.countDocuments({ _id: { $in: opportunityIds } }), Opportunity.countDocuments({ _id: { $in: opportunityIds }, status: 'Active' }),
    Application.countDocuments({ opportunity: { $in: opportunityIds } }), Application.countDocuments({ opportunity: { $in: opportunityIds }, status: { $in: ['Shortlisted', 'Interview'] } }),
    Application.countDocuments({ opportunity: { $in: opportunityIds }, status: 'Selected' }),
  ])
  res.json({ data: { role: 'company', metrics: { opportunities, activeOpportunities, applications, shortlisted, selected } } })
}

async function studentOverview(req, res) {
  const [profile, applications, activeApplications, saved] = await Promise.all([
    StudentProfile.findOne({ user: req.user._id }).select('readiness skills projects certificates').lean(),
    Application.countDocuments({ student: req.user._id }),
    Application.countDocuments({ student: req.user._id, status: { $nin: ['Rejected', 'Selected', 'Withdrawn'] } }),
    (await import('../models/SavedOpportunity.js')).SavedOpportunity.countDocuments({ user: req.user._id }),
  ])
  res.json({ data: { role: 'student', metrics: { readiness: profile?.readiness || 0, applications, activeApplications, saved, projects: profile?.projects?.length || 0, certificates: profile?.certificates?.length || 0 } } })
}

async function facultyOverview(req, res) {
  const userIds = await User.find({ role: 'student', ...(req.user.institution ? { institution: req.user.institution } : {}) }).distinct('_id')
  const [students, placementReady, applications, workshops] = await Promise.all([
    StudentProfile.countDocuments({ user: { $in: userIds } }), StudentProfile.countDocuments({ user: { $in: userIds }, readiness: { $gte: 75 } }),
    Application.countDocuments({ student: { $in: userIds } }), Workshop.countDocuments({ createdBy: req.user._id }),
  ])
  res.json({ data: { role: 'faculty', metrics: { students, placementReady, applications, workshops } } })
}

export async function overview(req, res) {
  if (req.user.role === 'admin') return adminOverview(res)
  if (req.user.role === 'company') return companyOverview(req, res)
  if (req.user.role === 'faculty') return facultyOverview(req, res)
  return studentOverview(req, res)
}

export async function skillDemand(req, res) {
  const data = await Opportunity.aggregate([
    { $match: { status: 'Active', deadline: { $gte: new Date() } } },
    { $unwind: '$skills' },
    { $group: { _id: { $toLower: '$skills' }, demand: { $sum: 1 } } },
    { $sort: { demand: -1 } }, { $limit: 20 },
    { $project: { _id: 0, skill: '$_id', demand: 1 } },
  ])
  res.json({ data: { skills: data } })
}
