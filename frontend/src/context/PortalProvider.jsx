import { AuthProvider } from './AuthContext'
import { UserProvider } from './UserContext'
import { ApplicationProvider } from './ApplicationContext'
import { NotificationProvider } from './NotificationContext'

export function PortalProvider({ children }) {
  return <AuthProvider><UserProvider><ApplicationProvider><NotificationProvider>{children}</NotificationProvider></ApplicationProvider></UserProvider></AuthProvider>
}
