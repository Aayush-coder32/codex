import { Router } from 'express'
import * as workshops from '../controllers/workshopController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { idSchema, workshopCreateSchema, workshopUpdateSchema } from '../validation/schemas.js'

const router = Router()
router.use(authenticate)
router.get('/', asyncHandler(workshops.listWorkshops))
router.get('/enrollments/mine', authorize('student'), asyncHandler(workshops.listMyEnrollments))
router.post('/', authorize('faculty', 'admin'), validate(workshopCreateSchema), asyncHandler(workshops.createWorkshop))
router.patch('/:id', authorize('faculty', 'admin'), validate(workshopUpdateSchema), asyncHandler(workshops.updateWorkshop))
router.post('/:id/enroll', authorize('student'), validate(idSchema), asyncHandler(workshops.enroll))
router.delete('/:id/enroll', authorize('student'), validate(idSchema), asyncHandler(workshops.cancelEnrollment))

export default router
