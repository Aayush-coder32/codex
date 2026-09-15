import { FacultyStudentSubmission } from '../models/FacultyStudentSubmission.js'
import { ApiError } from '../utils/ApiError.js'

const fileUrl = (file) => `/uploads/${file.filename}`

export async function createFacultyStudentSubmission(req, res) {
  const files = req.files || {}
  const required = ['photo', 'signature', 'class10Marksheet', 'class12Marksheet', 'btechMarksheet', 'mtechMarksheet']
  if (required.some((field) => !files[field]?.[0])) throw new ApiError(422, 'Please upload all required documents', 'MISSING_DOCUMENTS')
  const submission = await FacultyStudentSubmission.create({
    ...req.validated.body,
    photoUrl: fileUrl(files.photo[0]), signatureUrl: fileUrl(files.signature[0]),
    marksheets: { class10: fileUrl(files.class10Marksheet[0]), class12: fileUrl(files.class12Marksheet[0]), btech: fileUrl(files.btechMarksheet[0]), mtech: fileUrl(files.mtechMarksheet[0]) },
    submittedBy: req.user._id,
  })
  res.status(201).json({ data: { submission } })
}
