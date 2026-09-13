import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { interviewPhotoUpload } from '../middleware/upload.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { createInterviewPreparation } from '../controllers/interviewPreparationController.js'

const router = Router()
router.post('/', authenticate, interviewPhotoUpload.single('photo'), asyncHandler(createInterviewPreparation))

export default router
