import { Router } from 'express'
import * as messages from '../controllers/messageController.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { conversationCreateSchema, messageCreateSchema } from '../validation/schemas.js'

const router = Router()
router.use(authenticate)
router.get('/', asyncHandler(messages.listConversations))
router.post('/', validate(conversationCreateSchema), asyncHandler(messages.createConversation))
router.get('/:id/messages', asyncHandler(messages.listMessages))
router.post('/:id/messages', validate(messageCreateSchema), asyncHandler(messages.sendMessage))

export default router
