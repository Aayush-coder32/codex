import { Router } from 'express'
import * as notifications from '../controllers/notificationController.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { idSchema } from '../validation/schemas.js'

const router = Router()
router.use(authenticate)
router.get('/', asyncHandler(notifications.listNotifications))
router.patch('/read-all', asyncHandler(notifications.markAllRead))
router.patch('/:id/read', validate(idSchema), asyncHandler(notifications.markRead))
router.delete('/:id', validate(idSchema), asyncHandler(notifications.deleteNotification))

export default router
