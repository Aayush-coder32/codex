import multer from 'multer'
import { ZodError } from 'zod'
import { ApiError } from '../utils/ApiError.js'

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} was not found`, 'ROUTE_NOT_FOUND'))
}

export function errorHandler(error, req, res, _next) {
  let status = error.status || 500
  let code = error.code || 'INTERNAL_ERROR'
  let message = error.message || 'An unexpected error occurred'
  let details = error.details

  if (error instanceof ZodError) {
    status = 422
    code = 'VALIDATION_ERROR'
    message = 'The request contains invalid data'
    details = error.issues
  } else if (error instanceof multer.MulterError) {
    status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    code = 'UPLOAD_ERROR'
  } else if (error?.name === 'CastError') {
    status = 400
    code = 'INVALID_ID'
    message = 'The supplied resource id is invalid'
  } else if (error?.code === 11000) {
    status = 409
    code = 'DUPLICATE_RESOURCE'
    message = 'A resource with those unique fields already exists'
    details = error.keyValue
  }

  if (status >= 500) console.error(`[${req.id}]`, error)

  res.status(status).json({
    error: {
      code,
      message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
      ...(details ? { details } : {}),
      requestId: req.id,
    },
  })
}
