import { createContext, useCallback, useContext, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { initialWorkshops } from '../data/workshops'

const initialStudents = []

const UserContext = createContext(null)

const defaultProfile = {
  name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', location: 'Jaipur, Rajasthan',
  degree: 'B.Tech in Computer Science', college: 'National Institute of Technology, Jaipur', branch: 'Computer Science & Engineering',
  graduationYear: '2027', cgpa: '8.6', about: 'Aspiring full-stack engineer who enjoys building thoughtful digital products and learning through real-world challenges.',
  skills: [{ name: 'React', level: 85 }, { name: 'JavaScript', level: 80 }, { name: 'Java', level: 68 }, { name: 'Python', level: 62 }, { name: 'Node.js', level: 45 }, { name: 'MongoDB', level: 40 }, { name: 'Git', level: 75 }, { name: 'Docker', level: 35 }],
}

const defaultProjects = [
  { id: 'p1', title: 'CampusConnect', description: 'A peer learning platform for discovering mentors, study circles and campus events.', technologies: ['React', 'Firebase', 'Tailwind'], github: 'https://github.com/', live: 'https://example.com' },
  { id: 'p2', title: 'Smart Expense AI', description: 'Personal finance dashboard with smart spending categorization and insights.', technologies: ['JavaScript', 'Node.js', 'MongoDB'], github: 'https://github.com/', live: '' },
]

const defaultCertificates = [
  { id: 'c1', name: 'Meta Front-End Developer', organization: 'Coursera · Meta', issueDate: '2026-05-15', credential: 'https://coursera.org/' },
  { id: 'c2', name: 'JavaScript Algorithms', organization: 'freeCodeCamp', issueDate: '2026-02-10', credential: 'https://freecodecamp.org/' },
  { id: 'c3', name: 'Git & GitHub Foundations', organization: 'GitHub', issueDate: '2025-12-05', credential: 'https://github.com/' },
]

export function UserProvider({ children }) {
  const [profile, setProfile] = useLocalStorage('skillbridge_profile', defaultProfile)
  const [projects, setProjects] = useLocalStorage('skillbridge_projects', defaultProjects)
  const [certificates, setCertificates] = useLocalStorage('skillbridge_certificates', defaultCertificates)
  const [workshops, setWorkshops] = useLocalStorage('skillbridge_workshops', initialWorkshops)
  const [students, setStudents] = useLocalStorage('skillbridge_students', [])
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, tone = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, message, tone }])
    setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3500)
  }, [])

  const upsert = (setter, item) => setter((items) => item.id ? items.map((old) => old.id === item.id ? item : old) : [{ ...item, id: `id-${Date.now()}` }, ...items])
  const remove = (setter, id) => setter((items) => items.filter((item) => item.id !== id))

  const value = { profile, setProfile, projects, upsertProject: (x) => upsert(setProjects, x), removeProject: (id) => remove(setProjects, id), certificates, upsertCertificate: (x) => upsert(setCertificates, x), removeCertificate: (id) => remove(setCertificates, id), workshops, addWorkshop: (x) => upsert(setWorkshops, x), students, addStudent: (x) => upsert(setStudents, x), toasts, toast }
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
