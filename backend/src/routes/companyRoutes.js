import { Router } from 'express'
import * as companies from '../db/controllers/companies.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { companyUpdateSchema } from '../validation/schemas.js'

const router = Router()
router.get('/', asyncHandler(companies.listCompanies))
router.get('/me', authenticate, authorize('company'), asyncHandler(companies.getMyCompany))
router.patch('/me', authenticate, authorize('company'), validate(companyUpdateSchema), asyncHandler(companies.updateMyCompany))
router.get('/:id', asyncHandler(companies.getCompany))

export default router
