// MongoDB demo data seed.
import bcrypt from 'bcryptjs'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { RefreshToken } from '../models/RefreshToken.js'
import { Institution } from '../models/Institution.js'
import { Company } from '../models/Company.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { Opportunity } from '../models/Opportunity.js'
import { Application } from '../models/Application.js'
import { SavedOpportunity } from '../models/SavedOpportunity.js'
import { Workshop } from '../models/Workshop.js'
import { WorkshopEnrollment } from '../models/WorkshopEnrollment.js'
import { Conversation } from '../models/Conversation.js'
import { Message } from '../models/Message.js'
import { Notification } from '../models/Notification.js'
import { Announcement } from '../models/Announcement.js'

if (env.nodeEnv === 'production') throw new Error('The demo seed is disabled in production')

const companyData = [
  ['TCS Digital', 'tcs-digital', 'IT Services', '600K+', 'Mumbai'],
  ['Infosys', 'infosys', 'Technology', '300K+', 'Bengaluru'],
  ['Razorpay', 'razorpay', 'Fintech', '3K+', 'Bengaluru'],
  ['Zoho', 'zoho', 'SaaS', '15K+', 'Chennai'],
  ['Wipro', 'wipro', 'Consulting', '230K+', 'Hyderabad'],
  ['Freshworks', 'freshworks', 'SaaS', '5K+', 'Chennai'],
]

const studentData = [
  { name: 'Aarav Sharma', email: 'student@skillbridge.demo', college: 'National Institute of Technology, Jaipur', branch: 'Computer Science & Engineering', degree: 'B.Tech in Computer Science', graduationYear: 2027, location: 'Jaipur, Rajasthan', readiness: 86, skills: [['React', 85], ['JavaScript', 80], ['Java', 68], ['Python', 62], ['Node.js', 45], ['MongoDB', 40], ['Git', 75], ['Docker', 35]] },
  { name: 'Meera Nair', email: 'meera@skillbridge.demo', college: 'College of Engineering, Pune', branch: 'Information Technology', degree: 'B.E.', graduationYear: 2027, location: 'Pune', readiness: 89, skills: [['Python', 90], ['ML', 82], ['SQL', 86]] },
  { name: 'Kabir Mehta', email: 'kabir@skillbridge.demo', college: 'Government Engineering College, Surat', branch: 'Computer Science', degree: 'B.Tech', graduationYear: 2028, location: 'Surat', readiness: 75, skills: [['Node.js', 82], ['MongoDB', 78], ['Docker', 70]] },
  { name: 'Ananya Singh', email: 'ananya@skillbridge.demo', college: 'Institute of Technology, Delhi', branch: 'AI & Data Science', degree: 'B.Tech', graduationYear: 2027, location: 'Delhi', readiness: 92, skills: [['Python', 92], ['TensorFlow', 85], ['AWS', 78]] },
  { name: 'Rohan Das', email: 'rohan@skillbridge.demo', college: 'Jadavpur University', branch: 'Electronics', degree: 'B.E.', graduationYear: 2027, location: 'Kolkata', readiness: 72, skills: [['Java', 83], ['Spring', 74], ['SQL', 76]] },
  { name: 'Ishita Rao', email: 'ishita@skillbridge.demo', college: 'RV College of Engineering', branch: 'Computer Science', degree: 'B.E.', graduationYear: 2028, location: 'Bengaluru', readiness: 81, skills: [['Figma', 90], ['React', 82], ['Research', 79]] },
]

const opportunityData = [
  ['Frontend Developer Intern', 'tcs-digital', 'Internship', 'Remote', 'Remote', '₹25,000/month', '6 months', ['React', 'JavaScript', 'HTML', 'CSS'], '2026-10-12', 6, 'B.Tech / BCA / MCA · 2026–27 batch', 'Work alongside the digital experience team to craft accessible, responsive customer platforms used at scale.', ['Build reusable React components', 'Translate product designs into responsive interfaces', 'Write maintainable tests and documentation']],
  ['MERN Stack Intern', 'infosys', 'Internship', 'Bengaluru', 'Hybrid', '₹30,000/month', '6 months', ['React', 'Node.js', 'MongoDB', 'Express'], '2026-10-20', 10, 'B.E. / B.Tech · CGPA 7.0+', 'Join a product engineering pod building full-stack solutions for enterprise clients.', ['Develop APIs with Express', 'Create React workflows', 'Collaborate in agile delivery']],
  ['Graduate Software Engineer', 'razorpay', 'Job', 'Bengaluru', 'On-site', '₹12–16 LPA', 'Full time', ['Java', 'DSA', 'SQL', 'Git'], '2026-10-05', 4, '2026 graduate · CS/IT', 'Solve high-impact payment engineering problems with an experienced platform team.', ['Design reliable services', 'Review code and observability', 'Own features from concept to release']],
  ['UI/UX Design Intern', 'zoho', 'Internship', 'Chennai', 'On-site', '₹22,000/month', '4 months', ['Figma', 'Research', 'Prototyping'], '2026-10-28', 3, 'Portfolio required', 'Design thoughtful product experiences for a diverse global customer base.', ['Create prototypes', 'Conduct usability research', 'Contribute to design systems']],
  ['Cloud Engineering Trainee', 'wipro', 'Job', 'Hyderabad', 'Hybrid', '₹7.5 LPA', 'Full time', ['AWS', 'Linux', 'Docker', 'Python'], '2026-11-02', 18, 'B.Tech · 60% throughout', 'Learn cloud operations and help modernize customer infrastructure.', ['Support AWS environments', 'Automate routine operations', 'Maintain cloud documentation']],
  ['Data Science Intern', 'freshworks', 'Internship', 'Remote', 'Remote', '₹35,000/month', '5 months', ['Python', 'Pandas', 'SQL', 'ML'], '2026-10-18', 5, 'Quantitative degree · Python projects', 'Explore product data and build models that improve customer experience.', ['Prepare analytical datasets', 'Experiment with ML models', 'Present insights to product teams']],
  ['DevOps Intern', 'razorpay', 'Internship', 'Pune', 'Hybrid', '₹32,000/month', '6 months', ['Docker', 'Kubernetes', 'CI/CD', 'Linux'], '2026-10-25', 4, 'CS/IT students · Linux knowledge', 'Help accelerate developer workflows across a modern fintech platform.', ['Improve CI pipelines', 'Support container platforms', 'Track system health']],
  ['Associate Product Analyst', 'zoho', 'Job', 'Chennai', 'On-site', '₹8–10 LPA', 'Full time', ['SQL', 'Analytics', 'Communication'], '2026-11-08', 7, 'Any engineering degree', 'Turn customer signals into clear recommendations for product teams.', ['Analyze usage data', 'Create product reports', 'Coordinate discovery sessions']],
]

async function clearSeedData() {
  await Promise.all([
    RefreshToken.deleteMany({}), WorkshopEnrollment.deleteMany({}), Message.deleteMany({}), Conversation.deleteMany({}),
    Notification.deleteMany({}), SavedOpportunity.deleteMany({}), Application.deleteMany({}), Opportunity.deleteMany({}),
    Workshop.deleteMany({}), Announcement.deleteMany({}), StudentProfile.deleteMany({}), User.deleteMany({}),
    Company.deleteMany({}), Institution.deleteMany({}),
  ])
}

async function seed() {
  await connectDatabase()
  await clearSeedData()
  const passwordHash = await bcrypt.hash('skillbridge', 12)

  const institutions = await Institution.insertMany([
    { name: 'National Institute of Technology, Jaipur', code: 'NITJ', type: 'Institute', city: 'Jaipur', state: 'Rajasthan', verified: true },
    { name: 'College of Engineering, Pune', code: 'COEP', type: 'College', city: 'Pune', state: 'Maharashtra', verified: true },
    { name: 'Institute of Technology, Delhi', code: 'ITD', type: 'Institute', city: 'Delhi', state: 'Delhi', verified: true },
    { name: 'RV College of Engineering', code: 'RVCE', type: 'College', city: 'Bengaluru', state: 'Karnataka', verified: true },
  ])
  const institutionByCode = Object.fromEntries(institutions.map((item) => [item.code, item]))

  const companies = await Company.insertMany(companyData.map(([name, slug, industry, employeeCount, headquarters]) => ({ name, slug, industry, employeeCount, headquarters, verified: true })))
  const companyBySlug = Object.fromEntries(companies.map((item) => [item.slug, item]))

  const admin = await User.create({ name: 'Rajiv Malhotra', email: 'admin@skillbridge.demo', passwordHash, role: 'admin', emailVerified: true })
  const faculty = await User.create({ name: 'Dr. Neha Kapoor', email: 'faculty@skillbridge.demo', passwordHash, role: 'faculty', institution: institutionByCode.NITJ._id, emailVerified: true })
  const recruiter = await User.create({ name: 'Priya Nair', email: 'company@skillbridge.demo', passwordHash, role: 'company', company: companyBySlug.infosys._id, emailVerified: true })
  const studentUsers = await User.insertMany(studentData.map((item, index) => ({
    name: item.name, email: item.email, passwordHash, role: 'student', emailVerified: true,
    institution: index === 0 ? institutionByCode.NITJ._id : index === 1 ? institutionByCode.COEP._id : index === 3 ? institutionByCode.ITD._id : index === 5 ? institutionByCode.RVCE._id : null,
  })))

  const studentProfiles = await StudentProfile.insertMany(studentData.map((item, index) => ({
    user: studentUsers[index]._id, phone: index === 0 ? '+91 98765 43210' : undefined,
    location: item.location, degree: item.degree, college: item.college, branch: item.branch,
    graduationYear: item.graduationYear, cgpa: index === 0 ? 8.6 : undefined,
    about: index === 0 ? 'Aspiring full-stack engineer who enjoys building thoughtful digital products and learning through real-world challenges.' : undefined,
    readiness: item.readiness, skills: item.skills.map(([name, level]) => ({ name, level })),
    projects: index === 0 ? [
      { title: 'CampusConnect', description: 'A peer learning platform for mentors, study circles and campus events.', technologies: ['React', 'Firebase', 'Tailwind'], github: 'https://github.com/', live: 'https://example.com' },
      { title: 'Smart Expense AI', description: 'Personal finance dashboard with smart categorization and insights.', technologies: ['JavaScript', 'Node.js', 'MongoDB'], github: 'https://github.com/' },
    ] : [],
    certificates: index === 0 ? [
      { name: 'Meta Front-End Developer', organization: 'Coursera · Meta', issueDate: new Date('2026-05-15'), credential: 'https://coursera.org/' },
      { name: 'JavaScript Algorithms', organization: 'freeCodeCamp', issueDate: new Date('2026-02-10'), credential: 'https://freecodecamp.org/' },
      { name: 'Git & GitHub Foundations', organization: 'GitHub', issueDate: new Date('2025-12-05'), credential: 'https://github.com/' },
    ] : [],
    preferences: index === 0 ? { targetRole: 'MERN Developer', workMode: 'Flexible', locations: ['Bengaluru', 'Pune', 'Remote'], opportunityTypes: ['Internship', 'Job'] } : undefined,
  })))

  const opportunities = await Opportunity.insertMany(opportunityData.map(([title, slug, type, location, mode, pay, duration, skills, deadline, openings, eligibility, description, responsibilities]) => ({
    title, company: companyBySlug[slug]._id, createdBy: slug === 'infosys' ? recruiter._id : admin._id,
    type, location, mode, pay, duration, skills, deadline: new Date(deadline), openings, eligibility, description, responsibilities,
    status: 'Active', publishedAt: new Date('2026-09-08'),
  })))

  const initialApplications = [
    [0, 1, 'Under Review', 78], [0, 2, 'Shortlisted', 87], [0, 5, 'Interview', 81], [0, 3, 'Rejected', 73],
    [1, 1, 'Shortlisted', 91], [2, 1, 'Rejected', 84], [3, 1, 'Interview', 89], [5, 1, 'Applied', 87],
  ]
  const applications = await Application.insertMany(initialApplications.map(([studentIndex, opportunityIndex, status, matchScore]) => ({
    student: studentUsers[studentIndex]._id, opportunity: opportunities[opportunityIndex]._id, status, matchScore,
    history: [{ status: 'Applied', changedBy: studentUsers[studentIndex]._id, at: new Date('2026-09-08') }, ...(status === 'Applied' ? [] : [{ status, changedBy: opportunityIndex === 1 ? recruiter._id : admin._id }])],
  })))
  await Promise.all(opportunities.map((opportunity) => Opportunity.updateOne({ _id: opportunity._id }, { $set: { 'stats.applications': applications.filter((item) => item.opportunity.equals(opportunity._id)).length } })))
  await SavedOpportunity.create({ user: studentUsers[0]._id, opportunity: opportunities[2]._id })

  const workshops = await Workshop.insertMany([
    { name: 'AWS Cloud Fundamentals Workshop', skill: 'Cloud', instructor: 'Rahul Verma · AWS', institution: institutionByCode.NITJ._id, createdBy: faculty._id, startDate: new Date('2026-09-22'), duration: '2 days', capacity: 80, enrolledCount: 62, description: 'A hands-on introduction to core AWS services and cloud architecture.', mode: 'Online', status: 'Open' },
    { name: 'Modern React Engineering', skill: 'React', instructor: 'Asha Menon · Freshworks', institution: institutionByCode.NITJ._id, createdBy: faculty._id, startDate: new Date('2026-10-04'), duration: '3 weeks', capacity: 50, enrolledCount: 41, description: 'Production React patterns taught through a guided team project.', mode: 'Hybrid', status: 'Open' },
  ])

  const recruiterConversation = await Conversation.create({ participants: [studentUsers[0]._id, recruiter._id], lastMessageAt: new Date() })
  const mentorConversation = await Conversation.create({ participants: [studentUsers[0]._id, faculty._id], lastMessageAt: new Date(Date.now() - 86_400_000) })
  await Message.insertMany([
    { conversation: recruiterConversation._id, sender: recruiter._id, text: 'Hi! Your profile stood out for our MERN internship.', readBy: [{ user: recruiter._id }] },
    { conversation: recruiterConversation._id, sender: studentUsers[0]._id, text: 'Thank you! I would love to learn more about the role.', readBy: [{ user: studentUsers[0]._id }] },
    { conversation: recruiterConversation._id, sender: recruiter._id, text: 'Great — are you available for a short call on Friday?', readBy: [{ user: recruiter._id }] },
    { conversation: mentorConversation._id, sender: faculty._id, text: 'I reviewed your skill roadmap. Excellent progress this week.', readBy: [{ user: faculty._id }] },
  ])

  await Notification.insertMany([
    { recipient: studentUsers[0]._id, title: 'Application shortlisted', message: 'Your application for Graduate Software Engineer has been shortlisted.', type: 'success', link: '/student/applications' },
    { recipient: studentUsers[0]._id, title: '92% profile match', message: 'A new MERN Stack internship matches your profile.', type: 'opportunity', link: '/student/opportunities' },
    { recipient: studentUsers[0]._id, title: 'Analysis updated', message: 'Your skill analysis has been updated with three recommendations.', type: 'info', readAt: new Date() },
    { recipient: studentUsers[0]._id, title: 'Workshop registration', message: 'AWS Cloud Fundamentals workshop registration is now open.', type: 'event', readAt: new Date() },
  ])

  await Announcement.insertMany([
    { title: 'National AI Skills Challenge registrations open', message: 'Institutions can nominate student teams until 30 September.', audience: 'institutions', author: admin._id, status: 'Published', publishedAt: new Date('2026-09-10') },
    { title: 'Quarterly placement report due', message: 'Please submit verified placement outcomes for July–September.', audience: 'faculty', author: admin._id, status: 'Published', publishedAt: new Date('2026-09-08') },
  ])

  console.info('Seed complete.')
  console.info('Demo accounts: student, faculty, company, admin @skillbridge.demo')
  console.info('Password: skillbridge')
  console.info(`Created ${studentProfiles.length} students, ${companies.length} companies, ${opportunities.length} opportunities, ${workshops.length} workshops.`)
}

seed().then(disconnectDatabase).catch(async (error) => {
  console.error(error)
  await disconnectDatabase()
  process.exit(1)
})
