import bcrypt from 'bcryptjs'
import { env } from '../src/config/env.js'
import { pool, transaction } from '../src/config/database.js'
import { newId } from '../src/db/records.js'

if (env.nodeEnv === 'production') throw new Error('The demo seed is disabled in production')

const companies = [
  ['TCS Digital', 'tcs-digital', 'IT Services', '600K+', 'Mumbai'],
  ['Infosys', 'infosys', 'Technology', '300K+', 'Bengaluru'],
  ['Razorpay', 'razorpay', 'Fintech', '3K+', 'Bengaluru'],
  ['Zoho', 'zoho', 'SaaS', '15K+', 'Chennai'],
  ['Wipro', 'wipro', 'Consulting', '230K+', 'Hyderabad'],
  ['Freshworks', 'freshworks', 'SaaS', '5K+', 'Chennai'],
]

const students = [
  { name: 'Aarav Sharma', email: 'student@skillbridge.demo', college: 'National Institute of Technology, Jaipur', branch: 'Computer Science & Engineering', degree: 'B.Tech in Computer Science', graduationYear: 2027, location: 'Jaipur, Rajasthan', readiness: 86, institution: 'NITJ', skills: [['React', 85], ['JavaScript', 80], ['Java', 68], ['Python', 62], ['Node.js', 45], ['PostgreSQL', 40], ['Git', 75], ['Docker', 35]] },
  { name: 'Meera Nair', email: 'meera@skillbridge.demo', college: 'College of Engineering, Pune', branch: 'Information Technology', degree: 'B.E.', graduationYear: 2027, location: 'Pune', readiness: 89, institution: 'COEP', skills: [['Python', 90], ['ML', 82], ['SQL', 86]] },
  { name: 'Kabir Mehta', email: 'kabir@skillbridge.demo', college: 'Government Engineering College, Surat', branch: 'Computer Science', degree: 'B.Tech', graduationYear: 2028, location: 'Surat', readiness: 75, skills: [['Node.js', 82], ['PostgreSQL', 78], ['Docker', 70]] },
  { name: 'Ananya Singh', email: 'ananya@skillbridge.demo', college: 'Institute of Technology, Delhi', branch: 'AI & Data Science', degree: 'B.Tech', graduationYear: 2027, location: 'Delhi', readiness: 92, institution: 'ITD', skills: [['Python', 92], ['TensorFlow', 85], ['AWS', 78]] },
  { name: 'Rohan Das', email: 'rohan@skillbridge.demo', college: 'Jadavpur University', branch: 'Electronics', degree: 'B.E.', graduationYear: 2027, location: 'Kolkata', readiness: 72, skills: [['Java', 83], ['Spring', 74], ['SQL', 76]] },
  { name: 'Ishita Rao', email: 'ishita@skillbridge.demo', college: 'RV College of Engineering', branch: 'Computer Science', degree: 'B.E.', graduationYear: 2028, location: 'Bengaluru', readiness: 81, institution: 'RVCE', skills: [['Figma', 90], ['React', 82], ['Research', 79]] },
]

const opportunities = [
  ['Frontend Developer Intern', 'tcs-digital', 'Internship', 'Remote', 'Remote', '₹25,000/month', '6 months', ['React', 'JavaScript', 'HTML', 'CSS'], '2027-10-12', 6, 'B.Tech / BCA / MCA', 'Work alongside the digital experience team to craft accessible, responsive customer platforms used at scale.'],
  ['Full Stack Intern', 'infosys', 'Internship', 'Bengaluru', 'Hybrid', '₹30,000/month', '6 months', ['React', 'Node.js', 'PostgreSQL', 'Express'], '2027-10-20', 10, 'B.E. / B.Tech · CGPA 7.0+', 'Join a product engineering pod building full-stack solutions for enterprise clients.'],
  ['Graduate Software Engineer', 'razorpay', 'Job', 'Bengaluru', 'On-site', '₹12–16 LPA', 'Full time', ['Java', 'DSA', 'SQL', 'Git'], '2027-10-05', 4, 'CS/IT graduate', 'Solve high-impact payment engineering problems with an experienced platform team.'],
  ['UI/UX Design Intern', 'zoho', 'Internship', 'Chennai', 'On-site', '₹22,000/month', '4 months', ['Figma', 'Research', 'Prototyping'], '2027-10-28', 3, 'Portfolio required', 'Design thoughtful product experiences for a diverse global customer base.'],
  ['Cloud Engineering Trainee', 'wipro', 'Job', 'Hyderabad', 'Hybrid', '₹7.5 LPA', 'Full time', ['AWS', 'Linux', 'Docker', 'Python'], '2027-11-02', 18, 'B.Tech · 60% throughout', 'Learn cloud operations and help modernize customer infrastructure.'],
  ['Data Science Intern', 'freshworks', 'Internship', 'Remote', 'Remote', '₹35,000/month', '5 months', ['Python', 'Pandas', 'SQL', 'ML'], '2027-10-18', 5, 'Quantitative degree', 'Explore product data and build models that improve customer experience.'],
  ['DevOps Intern', 'razorpay', 'Internship', 'Pune', 'Hybrid', '₹32,000/month', '6 months', ['Docker', 'Kubernetes', 'CI/CD', 'Linux'], '2027-10-25', 4, 'CS/IT students', 'Help accelerate developer workflows across a modern fintech platform.'],
  ['Associate Product Analyst', 'zoho', 'Job', 'Chennai', 'On-site', '₹8–10 LPA', 'Full time', ['SQL', 'Analytics', 'Communication'], '2027-11-08', 7, 'Any engineering degree', 'Turn customer signals into clear recommendations for product teams.'],
]

async function seed() {
  const passwordHash = await bcrypt.hash('skillbridge', 12)
  const counts = await transaction(async (client) => {
    const execute = (text, values = []) => client.query(text, values)
    await execute(`TRUNCATE TABLE
      refresh_tokens, workshop_enrollments, messages, conversation_participants, conversations,
      notifications, saved_opportunities, applications, opportunities, workshops, announcements,
      student_profiles, users, companies, institutions CASCADE`)

    const institutionByCode = {}
    for (const [name, code, type, city, state] of [
      ['National Institute of Technology, Jaipur', 'NITJ', 'Institute', 'Jaipur', 'Rajasthan'],
      ['College of Engineering, Pune', 'COEP', 'College', 'Pune', 'Maharashtra'],
      ['Institute of Technology, Delhi', 'ITD', 'Institute', 'Delhi', 'Delhi'],
      ['RV College of Engineering', 'RVCE', 'College', 'Bengaluru', 'Karnataka'],
    ]) {
      const row = (await execute(
        'INSERT INTO institutions (id, name, code, type, city, state, verified) VALUES ($1,$2,$3,$4,$5,$6,TRUE) RETURNING *',
        [newId(), name, code, type, city, state],
      )).rows[0]
      institutionByCode[code] = row
    }

    const companyBySlug = {}
    for (const [name, slug, industry, employeeCount, headquarters] of companies) {
      const row = (await execute(
        'INSERT INTO companies (id, name, slug, industry, employee_count, headquarters, verified) VALUES ($1,$2,$3,$4,$5,$6,TRUE) RETURNING *',
        [newId(), name, slug, industry, employeeCount, headquarters],
      )).rows[0]
      companyBySlug[slug] = row
    }

    async function addUser({ name, email, role, companyId = null, institutionId = null }) {
      return (await execute(
        `INSERT INTO users (id, name, email, password_hash, role, company_id, institution_id, email_verified)
         VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE) RETURNING *`,
        [newId(), name, email, passwordHash, role, companyId, institutionId],
      )).rows[0]
    }

    const admin = await addUser({ name: 'Rajiv Malhotra', email: 'admin@skillbridge.demo', role: 'admin' })
    const faculty = await addUser({ name: 'Dr. Neha Kapoor', email: 'faculty@skillbridge.demo', role: 'faculty', institutionId: institutionByCode.NITJ.id })
    const recruiter = await addUser({ name: 'Priya Nair', email: 'company@skillbridge.demo', role: 'company', companyId: companyBySlug.infosys.id })
    const studentUsers = []

    for (const [index, student] of students.entries()) {
      const user = await addUser({
        name: student.name, email: student.email, role: 'student',
        institutionId: student.institution ? institutionByCode[student.institution].id : null,
      })
      studentUsers.push(user)
      const projectId = newId()
      const projects = index === 0 ? [{
        _id: projectId, id: projectId, title: 'CampusConnect',
        description: 'A peer learning platform for mentors, study circles and campus events.',
        technologies: ['React', 'Firebase', 'Tailwind'], github: 'https://github.com/',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }] : []
      await execute(
        `INSERT INTO student_profiles (
          id, user_id, phone, location, degree, college, branch, graduation_year, cgpa,
          about, readiness, skills, projects, certificates, preferences
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14::jsonb,$15::jsonb)`,
        [newId(), user.id, index === 0 ? '+91 98765 43210' : null, student.location, student.degree,
          student.college, student.branch, student.graduationYear, index === 0 ? 8.6 : null,
          index === 0 ? 'Aspiring full-stack engineer who enjoys building thoughtful digital products.' : null,
          student.readiness, JSON.stringify(student.skills.map(([name, level]) => ({ name, level }))),
          JSON.stringify(projects), JSON.stringify([]), JSON.stringify(index === 0 ? {
            targetRole: 'Full Stack Developer', workMode: 'Flexible', locations: ['Bengaluru', 'Pune', 'Remote'],
            opportunityTypes: ['Internship', 'Job'],
          } : {})],
      )
    }

    const opportunityRows = []
    for (const [title, slug, type, location, mode, pay, duration, skills, deadline, openings, eligibility, description] of opportunities) {
      const row = (await execute(
        `INSERT INTO opportunities (
          id, title, company_id, created_by, type, location, mode, pay, duration, skills,
          deadline, openings, eligibility, description, status, published_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13,$14,'Active',NOW()) RETURNING *`,
        [newId(), title, companyBySlug[slug].id, slug === 'infosys' ? recruiter.id : admin.id,
          type, location, mode, pay, duration, JSON.stringify(skills), new Date(deadline), openings, eligibility, description],
      )).rows[0]
      opportunityRows.push(row)
    }

    for (const [studentIndex, opportunityIndex, status, matchScore] of [
      [0, 1, 'Under Review', 78], [0, 2, 'Shortlisted', 87], [0, 5, 'Interview', 81],
      [0, 3, 'Rejected', 73], [1, 1, 'Shortlisted', 91], [2, 1, 'Rejected', 84],
      [3, 1, 'Interview', 89], [5, 1, 'Applied', 87],
    ]) {
      const history = [{ status: 'Applied', changedBy: studentUsers[studentIndex].id, at: new Date().toISOString() }]
      if (status !== 'Applied') history.push({ status, changedBy: opportunityIndex === 1 ? recruiter.id : admin.id, at: new Date().toISOString() })
      await execute(
        'INSERT INTO applications (id, opportunity_id, student_id, status, match_score, history) VALUES ($1,$2,$3,$4,$5,$6::jsonb)',
        [newId(), opportunityRows[opportunityIndex].id, studentUsers[studentIndex].id, status, matchScore, JSON.stringify(history)],
      )
    }
    await execute('UPDATE opportunities o SET application_count = (SELECT COUNT(*) FROM applications a WHERE a.opportunity_id = o.id)')
    await execute('INSERT INTO saved_opportunities (id, user_id, opportunity_id) VALUES ($1,$2,$3)', [newId(), studentUsers[0].id, opportunityRows[2].id])

    const workshop = (await execute(
      `INSERT INTO workshops (id, name, skill, instructor, institution_id, created_by, start_date, duration, capacity, enrolled_count, description, mode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [newId(), 'AWS Cloud Fundamentals Workshop', 'Cloud', 'Rahul Verma · AWS', institutionByCode.NITJ.id,
        faculty.id, new Date('2027-09-22'), '2 days', 80, 0, 'A hands-on introduction to core AWS services.', 'Online'],
    )).rows[0]

    const conversation = (await execute('INSERT INTO conversations (id) VALUES ($1) RETURNING *', [newId()])).rows[0]
    await execute('INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1,$2),($1,$3)', [conversation.id, studentUsers[0].id, recruiter.id])
    await execute(
      'INSERT INTO messages (id, conversation_id, sender_id, text, read_by) VALUES ($1,$2,$3,$4,$5::jsonb)',
      [newId(), conversation.id, recruiter.id, 'Hi! Your profile stood out for our full-stack internship.', JSON.stringify([{ user: recruiter.id, at: new Date().toISOString() }])],
    )
    await execute(
      `INSERT INTO notifications (id, recipient_id, title, message, type, link)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [newId(), studentUsers[0].id, 'Application shortlisted', 'Your application has been shortlisted.', 'success', '/student/applications'],
    )
    await execute(
      `INSERT INTO announcements (id, title, message, audience, author_id, status, published_at)
       VALUES ($1,$2,$3,$4,$5,'Published',NOW())`,
      [newId(), 'National AI Skills Challenge registrations open', 'Institutions can nominate student teams.', 'institutions', admin.id],
    )

    return { students: studentUsers.length, companies: companies.length, opportunities: opportunityRows.length, workshops: workshop ? 1 : 0 }
  })

  console.info('PostgreSQL demo seed complete.')
  console.info('Demo accounts: student, faculty, company, admin @skillbridge.demo')
  console.info('Password: skillbridge')
  console.info(`Created ${counts.students} students, ${counts.companies} companies, ${counts.opportunities} opportunities, ${counts.workshops} workshops.`)
}

seed().then(() => pool.end()).catch(async (error) => {
  console.error(error)
  await pool.end().catch(() => {})
  process.exit(1)
})
