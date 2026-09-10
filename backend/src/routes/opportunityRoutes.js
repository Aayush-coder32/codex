import { Router } from 'express'
import * as opportunities from '../db/controllers/opportunities.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { idSchema, opportunityCreateSchema, opportunityListSchema, opportunityUpdateSchema } from '../validation/schemas.js'

const router = Router()
router.get('/', validate(opportunityListSchema), asyncHandler(opportunities.listOpportunities))
router.get('/mine', authenticate, authorize('company', 'admin'), validate(opportunityListSchema), asyncHandler(opportunities.listMyOpportunities))
router.get('/saved', authenticate, authorize('student'), asyncHandler(opportunities.listSaved))
router.post('/', authenticate, authorize('company', 'admin'), validate(opportunityCreateSchema), asyncHandler(opportunities.createOpportunity))
router.post('/:id/save', authenticate, authorize('student'), validate(idSchema), asyncHandler(opportunities.toggleSaved))
router.patch('/:id', authenticate, authorize('company', 'admin'), validate(opportunityUpdateSchema), asyncHandler(opportunities.updateOpportunity))
router.delete('/:id', authenticate, authorize('company', 'admin'), validate(idSchema), asyncHandler(opportunities.deleteOpportunity))
router.get('/:id', validate(idSchema), asyncHandler(opportunities.getOpportunity))

export default router
