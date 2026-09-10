import { Router } from 'express'
import * as announcements from '../controllers/announcementController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { announcementCreateSchema, announcementUpdateSchema, idSchema } from '../validation/schemas.js'

const router = Router()
router.get('/', asyncHandler(announcements.listPublic))
router.get('/feed', authenticate, asyncHandler(announcements.listFeed))
router.get('/manage', authenticate, authorize('admin'), asyncHandler(announcements.listAll))
router.post('/', authenticate, authorize('admin'), validate(announcementCreateSchema), asyncHandler(announcements.createAnnouncement))
router.patch('/:id', authenticate, authorize('admin'), validate(announcementUpdateSchema), asyncHandler(announcements.updateAnnouncement))
router.delete('/:id', authenticate, authorize('admin'), validate(idSchema), asyncHandler(announcements.deleteAnnouncement))

export default router
