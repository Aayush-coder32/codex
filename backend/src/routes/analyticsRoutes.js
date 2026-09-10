import { Router } from 'express'
import * as analytics from '../db/controllers/analytics.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.use(authenticate)
router.get('/overview', asyncHandler(analytics.overview))
router.get('/skill-demand', authorize('faculty', 'company', 'admin'), asyncHandler(analytics.skillDemand))

export default router
