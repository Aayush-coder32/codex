import { Router } from 'express'
import * as applications from '../db/controllers/applications.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { applicationCreateSchema, applicationStatusSchema, idSchema } from '../validation/schemas.js'

const router = Router()
router.use(authenticate)
router.post('/', authorize('student'), validate(applicationCreateSchema), asyncHandler(applications.apply))
router.get('/mine', authorize('student'), asyncHandler(applications.listMine))
router.get('/applicants', authorize('company', 'admin'), asyncHandler(applications.listApplicants))
router.patch('/:id/status', authorize('company', 'admin'), validate(applicationStatusSchema), asyncHandler(applications.updateStatus))
router.patch('/:id/withdraw', authorize('student'), validate(idSchema), asyncHandler(applications.withdraw))

export default router
