import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { validate } from '../middleware/validate.js'
import { leetCodeLoginSchema, leetCodeRegisterSchema } from '../validation/schemas.js'
import * as leetCode from '../controllers/leetCodeController.js'

const router = Router()
router.use(authenticate, authorize('student'))
router.get('/account', asyncHandler(leetCode.getAccount))
router.post('/register', validate(leetCodeRegisterSchema), asyncHandler(leetCode.register))
router.post('/login', validate(leetCodeLoginSchema), asyncHandler(leetCode.login))
router.post('/logout', asyncHandler(leetCode.logout))

export default router
