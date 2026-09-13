import { InterviewPreparation } from '../models/InterviewPreparation.js'
import { ApiError } from '../utils/ApiError.js'

export async function createInterviewPreparation(req, res) {
  if (!req.file) throw new ApiError(400, 'A live camera photo is required', 'PHOTO_REQUIRED')
  const preparation = await InterviewPreparation.create({
    user: req.user._id,
    name: req.body.name,
    email: req.body.email,
    company: req.body.company,
    role: req.body.role,
    introduction: req.body.introduction,
    photo: {
      path: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
  })
  res.status(201).json({ data: { preparation: { id: preparation.id, company: preparation.company, role: preparation.role, createdAt: preparation.createdAt } } })
}
