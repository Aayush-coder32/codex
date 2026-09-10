import { Conversation } from '../models/Conversation.js'
import { Message } from '../models/Message.js'
import { User } from '../models/User.js'
import { Notification } from '../models/Notification.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, pageMeta } from '../utils/pagination.js'

const isParticipant = (conversation, userId) => conversation.participants.some((id) => String(id._id || id) === String(userId))

export async function listConversations(req, res) {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name role avatarUrl').sort({ lastMessageAt: -1 }).lean()
  const lastMessages = await Promise.all(conversations.map((conversation) => Message.findOne({ conversation: conversation._id }).sort({ createdAt: -1 }).lean()))
  res.json({ data: { conversations: conversations.map((conversation, index) => ({ ...conversation, lastMessage: lastMessages[index] || null })) } })
}

export async function createConversation(req, res) {
  const participantIds = [...new Set([String(req.user._id), ...req.validated.body.participantIds])]
  if (await User.countDocuments({ _id: { $in: participantIds }, isActive: true }) !== participantIds.length) {
    throw new ApiError(422, 'One or more participants are invalid', 'INVALID_PARTICIPANTS')
  }
  const conversation = await Conversation.create({ participants: participantIds, title: req.validated.body.title })
  await conversation.populate('participants', 'name role avatarUrl')
  res.status(201).json({ data: { conversation } })
}

export async function listMessages(req, res) {
  const conversation = await Conversation.findById(req.params.id)
  if (!conversation || !isParticipant(conversation, req.user._id)) throw new ApiError(404, 'Conversation was not found', 'CONVERSATION_NOT_FOUND')
  const { page, limit, skip } = getPagination(req.query)
  const [messages, total] = await Promise.all([
    Message.find({ conversation: conversation._id }).populate('sender', 'name avatarUrl').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Message.countDocuments({ conversation: conversation._id }),
  ])
  await Message.updateMany(
    { conversation: conversation._id, sender: { $ne: req.user._id }, 'readBy.user': { $ne: req.user._id } },
    { $push: { readBy: { user: req.user._id, at: new Date() } } },
  )
  res.json({ data: { messages: messages.reverse() }, meta: pageMeta(total, page, limit) })
}

export async function sendMessage(req, res) {
  const conversation = await Conversation.findById(req.validated.params.id)
  if (!conversation || !isParticipant(conversation, req.user._id)) throw new ApiError(404, 'Conversation was not found', 'CONVERSATION_NOT_FOUND')
  const message = await Message.create({
    conversation: conversation._id, sender: req.user._id, text: req.validated.body.text,
    readBy: [{ user: req.user._id }],
  })
  conversation.lastMessageAt = new Date()
  await conversation.save()
  const recipients = conversation.participants.filter((id) => !id.equals(req.user._id))
  if (recipients.length) await Notification.insertMany(recipients.map((recipient) => ({
    recipient, type: 'message', title: `New message from ${req.user.name}`,
    message: message.text.slice(0, 180), link: `/${req.user.role}/messages`, metadata: { conversationId: conversation._id },
  })))
  await message.populate('sender', 'name avatarUrl')
  res.status(201).json({ data: { message } })
}
