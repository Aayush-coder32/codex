import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import * as auth from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../validation/schemas.js'

const router = Router()
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false })

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(auth.register))
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(auth.login))
router.post('/refresh', authLimiter, asyncHandler(auth.refresh))
router.post('/logout', asyncHandler(auth.logout))
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), asyncHandler(auth.forgotPassword))
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), asyncHandler(auth.resetPassword))
router.get('/me', authenticate, asyncHandler(auth.me))
router.patch('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(auth.changePassword))

export default router
