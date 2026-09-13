import { Router } from 'express'
import authRoutes from './authRoutes.js'
import userRoutes from './userRoutes.js'
import studentRoutes from './studentRoutes.js'
import companyRoutes from './companyRoutes.js'
import opportunityRoutes from './opportunityRoutes.js'
import applicationRoutes from './applicationRoutes.js'
import workshopRoutes from './workshopRoutes.js'
import messageRoutes from './messageRoutes.js'
import notificationRoutes from './notificationRoutes.js'
import announcementRoutes from './announcementRoutes.js'
import institutionRoutes from './institutionRoutes.js'
import analyticsRoutes from './analyticsRoutes.js'
import leetCodeRoutes from './leetCodeRoutes.js'

const router = Router()

router.get('/', (_req, res) => res.json({
  data: {
    name: 'SkillBridge API', version: '1.0.0',
    endpoints: ['auth', 'users', 'students', 'companies', 'institutions', 'opportunities', 'applications', 'workshops', 'conversations', 'notifications', 'announcements', 'analytics'],
  },
}))
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/students', studentRoutes)
router.use('/companies', companyRoutes)
router.use('/institutions', institutionRoutes)
router.use('/opportunities', opportunityRoutes)
router.use('/applications', applicationRoutes)
router.use('/workshops', workshopRoutes)
router.use('/conversations', messageRoutes)
router.use('/notifications', notificationRoutes)
router.use('/announcements', announcementRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/leetcode', leetCodeRoutes)

export default router
