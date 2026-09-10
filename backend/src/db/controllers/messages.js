import { query, transaction } from '../../config/database.js'
import { insertNotification, mapConversation, mapMessage, mapUser, newId, usersByIds } from '../records.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPagination, pageMeta } from '../../utils/pagination.js'

async function conversationForUser(conversationId, userId) {
  return (await query(
    `SELECT c.* FROM conversations c JOIN conversation_participants cp ON cp.conversation_id = c.id
     WHERE c.id = $1 AND cp.user_id = $2`,
    [conversationId, userId],
  )).rows[0]
}

export async function listConversations(req, res) {
  const rows = (await query(
    `SELECT c.* FROM conversations c JOIN conversation_participants cp ON cp.conversation_id = c.id
     WHERE cp.user_id = $1 ORDER BY c.last_message_at DESC`,
    [req.user.id],
  )).rows
  if (!rows.length) return res.json({ data: { conversations: [] } })
  const ids = rows.map((row) => row.id)
  const [participantRows, lastMessageRows] = await Promise.all([
    query('SELECT cp.conversation_id, u.* FROM conversation_participants cp JOIN users u ON u.id = cp.user_id WHERE cp.conversation_id = ANY($1::text[])', [ids]),
    query('SELECT DISTINCT ON (conversation_id) * FROM messages WHERE conversation_id = ANY($1::text[]) ORDER BY conversation_id, created_at DESC', [ids]),
  ])
  const participants = new Map(ids.map((id) => [id, []]))
  for (const row of participantRows.rows) participants.get(row.conversation_id).push(mapUser(row))
  const lastMessages = new Map(lastMessageRows.rows.map((row) => [row.conversation_id, mapMessage(row)]))
  const conversations = rows.map((row) => mapConversation(row, {
    participants: participants.get(row.id), lastMessage: lastMessages.get(row.id) || null,
  }))
  res.json({ data: { conversations } })
}

export async function createConversation(req, res) {
  const participantIds = [...new Set([req.user.id, ...req.validated.body.participantIds])]
  const valid = await query('SELECT COUNT(*)::int AS total FROM users WHERE id = ANY($1::text[]) AND is_active = TRUE', [participantIds])
  if (valid.rows[0].total !== participantIds.length) {
    throw new ApiError(422, 'One or more participants are invalid', 'INVALID_PARTICIPANTS')
  }
  const row = await transaction(async (client) => {
    const id = newId()
    const conversation = (await client.query('INSERT INTO conversations (id, title) VALUES ($1, $2) RETURNING *', [id, req.validated.body.title || null])).rows[0]
    for (const userId of participantIds) {
      await client.query('INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2)', [id, userId])
    }
    return conversation
  })
  const userMap = await usersByIds(participantIds)
  res.status(201).json({ data: { conversation: mapConversation(row, { participants: participantIds.map((id) => userMap.get(id)) }) } })
}

export async function listMessages(req, res) {
  const conversation = await conversationForUser(req.params.id, req.user.id)
  if (!conversation) throw new ApiError(404, 'Conversation was not found', 'CONVERSATION_NOT_FOUND')
  const { page, limit, skip } = getPagination(req.query)
  const [records, count] = await Promise.all([
    query('SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [conversation.id, limit, skip]),
    query('SELECT COUNT(*)::int AS total FROM messages WHERE conversation_id = $1', [conversation.id]),
  ])
  const senderMap = await usersByIds(records.rows.map((row) => row.sender_id))
  await query(
    `UPDATE messages SET read_by = read_by || jsonb_build_array(jsonb_build_object('user', $2::text, 'at', NOW()))
     WHERE conversation_id = $1 AND sender_id <> $2
     AND NOT (read_by @> jsonb_build_array(jsonb_build_object('user', $2::text)))`,
    [conversation.id, req.user.id],
  )
  const messages = records.rows.reverse().map((row) => mapMessage(row, { sender: senderMap.get(row.sender_id) || null }))
  res.json({ data: { messages }, meta: pageMeta(count.rows[0].total, page, limit) })
}

export async function sendMessage(req, res) {
  const conversation = await conversationForUser(req.validated.params.id, req.user.id)
  if (!conversation) throw new ApiError(404, 'Conversation was not found', 'CONVERSATION_NOT_FOUND')
  const row = await transaction(async (client) => {
    const execute = (text, values) => client.query(text, values)
    const result = await execute(
      `INSERT INTO messages (id, conversation_id, sender_id, text, read_by)
       VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING *`,
      [newId(), conversation.id, req.user.id, req.validated.body.text, JSON.stringify([{ user: req.user.id, at: new Date().toISOString() }])],
    )
    await execute('UPDATE conversations SET last_message_at = NOW() WHERE id = $1', [conversation.id])
    const recipients = (await execute(
      'SELECT user_id FROM conversation_participants WHERE conversation_id = $1 AND user_id <> $2',
      [conversation.id, req.user.id],
    )).rows
    for (const recipient of recipients) {
      await insertNotification(execute, {
        recipient: recipient.user_id, type: 'message', title: `New message from ${req.user.name}`,
        message: req.validated.body.text.slice(0, 180), link: `/${req.user.role}/messages`,
        metadata: { conversationId: conversation.id },
      })
    }
    return result.rows[0]
  })
  res.status(201).json({ data: { message: mapMessage(row, { sender: req.user }) } })
}
