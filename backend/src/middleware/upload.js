import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import multer from 'multer'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
export const uploadDirectory = path.resolve(currentDir, '../../uploads')

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_req, file, done) => done(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
})

export const resumeUpload = multer({
  storage,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, done) => {
    if (file.mimetype !== 'application/pdf') return done(new ApiError(415, 'Only PDF resumes are accepted', 'INVALID_FILE_TYPE'))
    done(null, true)
  },
})
