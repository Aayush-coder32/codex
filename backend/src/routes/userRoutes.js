import { Router } from 'express'
import * as users from '../db/controllers/users.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { resumeUpload } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { updateMeSchema, settingsSchema } from '../validation/schemas.js'

const router = Router()
router.use(authenticate)
router.patch('/me', validate(updateMeSchema), asyncHandler(users.updateMe))
router.patch('/me/settings', validate(settingsSchema), asyncHandler(users.updateSettings))
router.post('/me/resume', authorize('student'), resumeUpload.single('resume'), asyncHandler(users.uploadResume))

export default router
