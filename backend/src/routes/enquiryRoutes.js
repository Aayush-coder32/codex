import { Router } from 'express'
import { createEnquiry } from '../controllers/enquiryController.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { validate } from '../middleware/validate.js'
import { enquiryCreateSchema } from '../validation/schemas.js'

const router = Router()

router.post('/', validate(enquiryCreateSchema), asyncHandler(createEnquiry))

export default router
