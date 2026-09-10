import { z } from 'zod'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource id')
const email = z.string().trim().toLowerCase().email().max(254)
const password = z.string().min(8).max(72)
const role = z.enum(['student', 'faculty', 'company', 'admin'])
const opportunityStatus = z.enum(['Draft', 'Active', 'Closed', 'Archived'])
const applicationStatus = z.enum(['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Withdrawn'])

const emptyParams = z.object({}).passthrough()
const emptyQuery = z.object({}).passthrough()
const request = ({ body = z.object({}), params = emptyParams, query = emptyQuery }) => z.object({ body, params, query })

export const registerSchema = request({ body: z.object({
  name: z.string().trim().min(2).max(100),
  email,
  password,
  role: role.exclude(['admin']),
  organizationName: z.string().trim().min(2).max(160).optional(),
}) })

export const loginSchema = request({ body: z.object({ email, password: z.string().min(1).max(72) }) })
export const forgotPasswordSchema = request({ body: z.object({ email }) })
export const resetPasswordSchema = request({ body: z.object({ token: z.string().min(20), password }) })
export const changePasswordSchema = request({ body: z.object({ currentPassword: z.string().min(1), newPassword: password }) })

export const updateMeSchema = request({ body: z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: email.optional(),
  avatarUrl: z.string().url().nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, 'At least one field is required') })

export const settingsSchema = request({ body: z.object({
  timezone: z.string().max(80).optional(),
  language: z.string().max(20).optional(),
  theme: z.enum(['system', 'light', 'high-contrast']).optional(),
  notifications: z.object({
    opportunities: z.boolean().optional(), applications: z.boolean().optional(), messages: z.boolean().optional(),
    workshops: z.boolean().optional(), productUpdates: z.boolean().optional(),
  }).optional(),
}) })

const skill = z.object({ name: z.string().trim().min(1).max(80), level: z.number().min(0).max(100) })
export const studentProfileSchema = request({ body: z.object({
  phone: z.string().trim().max(30).optional(),
  location: z.string().trim().max(160).optional(),
  degree: z.string().trim().max(160).optional(),
  college: z.string().trim().max(200).optional(),
  branch: z.string().trim().max(160).optional(),
  graduationYear: z.coerce.number().int().min(2000).max(2200).optional(),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  about: z.string().trim().max(1200).optional(),
  skills: z.array(skill).max(100).optional(),
  preferences: z.object({
    targetRole: z.string().max(120).optional(),
    workMode: z.enum(['Remote', 'Hybrid', 'On-site', 'Flexible']).optional(),
    locations: z.array(z.string().trim().max(100)).max(20).optional(),
    opportunityTypes: z.array(z.enum(['Internship', 'Job', 'Apprenticeship'])).max(3).optional(),
  }).optional(),
}) })

const projectBody = z.object({
  title: z.string().trim().min(1).max(160), description: z.string().trim().max(2000).default(''),
  technologies: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  github: z.string().url().or(z.literal('')).optional(), live: z.string().url().or(z.literal('')).optional(),
})
const certificateBody = z.object({
  name: z.string().trim().min(1).max(160), organization: z.string().trim().max(160).optional(),
  issueDate: z.coerce.date().optional(), credential: z.string().url().or(z.literal('')).optional(),
})
export const projectCreateSchema = request({ body: projectBody })
export const projectUpdateSchema = request({ body: projectBody.partial(), params: z.object({ id: objectId }) })
export const certificateCreateSchema = request({ body: certificateBody })
export const certificateUpdateSchema = request({ body: certificateBody.partial(), params: z.object({ id: objectId }) })
export const idSchema = request({ params: z.object({ id: objectId }) })

const opportunityBody = z.object({
  title: z.string().trim().min(2).max(160),
  companyId: objectId.optional(),
  type: z.enum(['Internship', 'Job', 'Apprenticeship']),
  location: z.string().trim().min(2).max(160),
  mode: z.enum(['Remote', 'Hybrid', 'On-site']),
  pay: z.string().trim().max(120).optional(), duration: z.string().trim().max(120).optional(),
  skills: z.array(z.string().trim().min(1).max(80)).min(1).max(50),
  preferredSkills: z.array(z.string().trim().min(1).max(80)).max(50).default([]),
  deadline: z.coerce.date(), openings: z.coerce.number().int().min(1).max(10000).default(1),
  eligibility: z.string().trim().max(1000).optional(), experience: z.string().trim().max(200).optional(),
  description: z.string().trim().min(20).max(5000),
  responsibilities: z.array(z.string().trim().min(1).max(500)).max(50).default([]),
  status: opportunityStatus.default('Draft'),
})

export const opportunityCreateSchema = request({ body: opportunityBody })
export const opportunityUpdateSchema = request({ body: opportunityBody.partial(), params: z.object({ id: objectId }) })
export const opportunityListSchema = request({ query: z.object({
  page: z.string().optional(), limit: z.string().optional(), q: z.string().trim().max(160).optional(),
  type: z.enum(['Internship', 'Job', 'Apprenticeship']).optional(), mode: z.enum(['Remote', 'Hybrid', 'On-site']).optional(),
  location: z.string().trim().max(160).optional(), skill: z.string().trim().max(80).optional(),
  status: opportunityStatus.optional(), sort: z.enum(['newest', 'deadline', 'oldest']).default('newest'),
}) })

export const applicationCreateSchema = request({ body: z.object({
  opportunityId: objectId,
  coverLetter: z.string().trim().max(3000).optional(),
}) })
export const applicationStatusSchema = request({
  body: z.object({ status: applicationStatus.exclude(['Applied', 'Withdrawn']), note: z.string().trim().max(1000).optional() }),
  params: z.object({ id: objectId }),
})

export const workshopCreateSchema = request({ body: z.object({
  name: z.string().trim().min(2).max(180), skill: z.string().trim().min(1).max(100),
  instructor: z.string().trim().min(2).max(160), institutionId: objectId.optional(),
  startDate: z.coerce.date(), duration: z.string().max(100).optional(),
  capacity: z.coerce.number().int().min(1).max(100000), description: z.string().max(3000).optional(),
  mode: z.enum(['Online', 'On-site', 'Hybrid']).default('Online'), meetingUrl: z.string().url().optional(),
  status: z.enum(['Draft', 'Open', 'Closed', 'Completed', 'Cancelled']).default('Open'),
}) })
export const workshopUpdateSchema = request({ body: workshopCreateSchema.shape.body.partial(), params: z.object({ id: objectId }) })

export const conversationCreateSchema = request({ body: z.object({
  participantIds: z.array(objectId).min(1).max(20), title: z.string().trim().max(160).optional(),
}) })
export const messageCreateSchema = request({ body: z.object({ text: z.string().trim().min(1).max(4000) }), params: z.object({ id: objectId }) })

export const announcementCreateSchema = request({ body: z.object({
  title: z.string().trim().min(2).max(180), message: z.string().trim().min(2).max(3000),
  audience: z.enum(['everyone', 'students', 'faculty', 'companies', 'institutions']).default('everyone'),
  status: z.enum(['Draft', 'Published', 'Archived']).default('Published'), expiresAt: z.coerce.date().optional(),
}) })
export const announcementUpdateSchema = request({ body: announcementCreateSchema.shape.body.partial(), params: z.object({ id: objectId }) })

export const companyUpdateSchema = request({ body: z.object({
  name: z.string().trim().min(2).max(160).optional(), industry: z.string().max(120).optional(),
  employeeCount: z.string().max(80).optional(), headquarters: z.string().max(160).optional(),
  website: z.string().url().or(z.literal('')).optional(), about: z.string().max(3000).optional(), logoUrl: z.string().url().or(z.literal('')).optional(),
}) })

const institutionBody = z.object({
  name: z.string().trim().min(2).max(200), code: z.string().trim().min(2).max(30),
  type: z.enum(['University', 'Institute', 'College']).default('Institute'),
  city: z.string().trim().max(120).optional(), state: z.string().trim().max(120).optional(),
  website: z.string().url().or(z.literal('')).optional(), verified: z.boolean().default(false), isActive: z.boolean().default(true),
})
export const institutionCreateSchema = request({ body: institutionBody })
export const institutionUpdateSchema = request({ body: institutionBody.partial(), params: z.object({ id: objectId }) })
