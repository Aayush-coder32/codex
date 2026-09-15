import { Enquiry } from '../models/Enquiry.js'

export async function createEnquiry(req, res) {
  const enquiry = await Enquiry.create(req.validated.body)
  res.status(201).json({ data: { enquiry } })
}
