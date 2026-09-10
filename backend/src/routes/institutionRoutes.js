import { Router } from 'express'
import * as institutions from '../controllers/institutionController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { institutionCreateSchema, institutionUpdateSchema } from '../validation/schemas.js'

const router = Router()
router.get('/', asyncHandler(institutions.listInstitutions))
router.post('/', authenticate, authorize('admin'), validate(institutionCreateSchema), asyncHandler(institutions.createInstitution))
router.patch('/:id', authenticate, authorize('admin'), validate(institutionUpdateSchema), asyncHandler(institutions.updateInstitution))

export default router
