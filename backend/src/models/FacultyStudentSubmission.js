import mongoose from 'mongoose'

const facultyStudentSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  department: { type: String, required: true, trim: true, maxlength: 160 },
  qualification: { type: String, required: true, trim: true, maxlength: 160 },
  photoUrl: { type: String, required: true },
  signatureUrl: { type: String, required: true },
  marksheets: {
    class10: { type: String, required: true },
    class12: { type: String, required: true },
    btech: { type: String, required: true },
    mtech: { type: String, required: true },
  },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true })

export const FacultyStudentSubmission = mongoose.model('FacultyStudentSubmission', facultyStudentSubmissionSchema)
