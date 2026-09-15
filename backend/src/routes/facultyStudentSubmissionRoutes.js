import { Router } from 'express'
import { createFacultyStudentSubmission } from '../controllers/facultyStudentSubmissionController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { facultyStudentDocumentsUpload } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { facultyStudentSubmissionSchema } from '../validation/schemas.js'

const router = Router()
router.post('/', authenticate, authorize('faculty'), facultyStudentDocumentsUpload, validate(facultyStudentSubmissionSchema), asyncHandler(createFacultyStudentSubmission))
export default router
