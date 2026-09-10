import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { initialNotifications } from '../data/notifications'

const NotificationContext = createContext(null)
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useLocalStorage('skillbridge_notifications', initialNotifications)
  const markRead = (id) => setNotifications((items) => items.map((x) => x.id === id ? { ...x, read: true } : x))
  const markAllRead = () => setNotifications((items) => items.map((x) => ({ ...x, read: true })))
  const removeNotification = (id) => setNotifications((items) => items.filter((x) => x.id !== id))
  const unread = notifications.filter((x) => !x.read).length
  return <NotificationContext.Provider value={{ notifications, unread, markRead, markAllRead, removeNotification }}>{children}</NotificationContext.Provider>
}
export const useNotifications = () => useContext(NotificationContext)
