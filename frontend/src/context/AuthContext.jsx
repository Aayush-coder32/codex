import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AuthContext = createContext(null)
const roleUsers = {
  student: { name: 'Aarav Sharma', role: 'Student', email: 'aarav@skillbridge.demo', initials: 'AS' },
  faculty: { name: 'Dr. Neha Kapoor', role: 'Faculty', email: 'neha@skillbridge.demo', initials: 'NK' },
  company: { name: 'Priya Nair', role: 'Company', company: 'Infosys', email: 'priya@skillbridge.demo', initials: 'PN' },
  admin: { name: 'Rajiv Malhotra', role: 'Admin', email: 'admin@skillbridge.demo', initials: 'RM' },
}

export function AuthProvider({ children }) {
  const [session, setSession] = useLocalStorage('skillbridge_session', null)
  const login = (role = 'student') => { const user = roleUsers[role]; setSession({ role, user }); return user }
  const logout = () => setSession(null)
  return <AuthContext.Provider value={{ session, user: session?.user, role: session?.role, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
