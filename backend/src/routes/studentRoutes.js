import { Router } from 'express'
import * as students from '../db/controllers/users.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { certificateCreateSchema, certificateUpdateSchema, idSchema, projectCreateSchema, projectUpdateSchema, studentProfileSchema } from '../validation/schemas.js'

const router = Router()
router.use(authenticate)
router.get('/me', authorize('student'), asyncHandler(students.getMyProfile))
router.patch('/me', authorize('student'), validate(studentProfileSchema), asyncHandler(students.updateMyProfile))
router.get('/me/resume', authorize('student'), asyncHandler(students.downloadResume))
router.post('/me/projects', authorize('student'), validate(projectCreateSchema), asyncHandler(students.addProject))
router.patch('/me/projects/:id', authorize('student'), validate(projectUpdateSchema), asyncHandler(students.updateProject))
router.delete('/me/projects/:id', authorize('student'), validate(idSchema), asyncHandler(students.deleteProject))
router.post('/me/certificates', authorize('student'), validate(certificateCreateSchema), asyncHandler(students.addCertificate))
router.patch('/me/certificates/:id', authorize('student'), validate(certificateUpdateSchema), asyncHandler(students.updateCertificate))
router.delete('/me/certificates/:id', authorize('student'), validate(idSchema), asyncHandler(students.deleteCertificate))
router.get('/', authorize('faculty', 'company', 'admin'), asyncHandler(students.listStudents))
router.get('/:id', authorize('faculty', 'company', 'admin'), asyncHandler(students.getStudent))

export default router
