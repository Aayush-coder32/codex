import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, UserRound, ScanSearch, Map, BriefcaseBusiness, FileClock, FolderKanban, Award, MessageSquare, Bell, Settings, UsersRound, ChartNoAxesCombined, Handshake, Presentation, FileChartColumn, PlusSquare, ClipboardList, Search, Building2, Landmark, Megaphone, Menu, X, ChevronDown, LogOut, HelpCircle, Command, ArrowRight } from 'lucide-react'
import { Logo, ProfileAvatar, ToastHost } from '../common/UI'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { useApplications } from '../../context/ApplicationContext'

const navs = {
  student: [
    ['Dashboard','/student/dashboard',LayoutDashboard],['My Profile','/student/profile',UserRound],['Skill Analysis','/student/skill-analysis',ScanSearch],['Career Roadmap','/student/roadmap',Map],['Opportunities','/student/opportunities',BriefcaseBusiness],['Applications','/student/applications',FileClock],['Projects','/student/projects',FolderKanban],['Certificates','/student/certificates',Award],['Messages','/student/messages',MessageSquare],['Notifications','/student/notifications',Bell],['Settings','/student/settings',Settings],
  ],
  faculty: [
    ['Dashboard','/faculty/dashboard',LayoutDashboard],['Students','/faculty/students',UsersRound],['Skill Analytics','/faculty/analytics',ChartNoAxesCombined],['Industry Collaboration','/faculty/collaboration',Handshake],['Training Programs','/faculty/training',Presentation],['Communications','/faculty/communications',MessageSquare],['Reports','/faculty/reports',FileChartColumn],['Settings','/faculty/settings',Settings],
  ],
  company: [
    ['Dashboard','/company/dashboard',LayoutDashboard],['Post Opportunity','/company/post-opportunity',PlusSquare],['Manage Opportunities','/company/opportunities',BriefcaseBusiness],['Applications','/company/applications',ClipboardList],['Find Students','/company/students',Search],['Analytics','/company/analytics',ChartNoAxesCombined],['Messages','/company/messages',MessageSquare],['Company Profile','/company/profile',Building2],['Settings','/company/settings',Settings],
  ],
  admin: [
    ['Dashboard','/admin/dashboard',LayoutDashboard],['Institutions','/admin/institutions',Landmark],['Industry Partners','/admin/companies',Building2],['Students','/admin/students',UsersRound],['Opportunities','/admin/opportunities',BriefcaseBusiness],['Applications','/admin/applications',ClipboardList],['Reports','/admin/reports',FileChartColumn],['Announcements','/admin/announcements',Megaphone],['Settings','/admin/settings',Settings],
  ],
}

function Sidebar({ role, open, onClose }) {
  const items = navs[role] || navs.student
  return <><div onClick={onClose} className={`fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-sm lg:hidden ${open ? 'block' : 'hidden'}`}/><aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy-900 text-white transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="flex h-20 items-center justify-between border-b border-white/10 px-5"><Logo dark/><button onClick={onClose} className="rounded-lg p-2 text-white/60 hover:bg-white/10 lg:hidden" aria-label="Close navigation"><X size={20}/></button></div>
    <div className="mx-4 mt-5 rounded-xl border border-white/10 bg-white/[.06] p-3"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-blue-300">Workspace</p><p className="mt-1 text-sm font-semibold capitalize">{role} portal</p></div>
    <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label={`${role} navigation`}>{items.map(([label,to,Icon]) => <NavLink key={to} to={to} onClick={onClose} className={({isActive}) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20' : 'text-slate-300 hover:bg-white/[.07] hover:text-white'}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
    <div className="border-t border-white/10 p-4"><button className="flex w-full items-center gap-3 rounded-xl bg-white/[.06] p-3 text-left text-xs text-slate-300 hover:bg-white/10"><span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/30 text-indigo-200"><HelpCircle size={17}/></span><span><strong className="block text-white">Need help?</strong>Visit support centre</span></button></div>
  </aside></>
}

export default function AppShell({ role }) {
  const [menu, setMenu] = useState(false), [profileOpen, setProfileOpen] = useState(false), [query, setQuery] = useState('')
  const { user, logout } = useAuth(), { unread } = useNotifications(), { opportunities } = useApplications()
  const navigate = useNavigate(), location = useLocation()
  const suggestions = useMemo(() => query.trim().length > 1 ? opportunities.filter((x) => `${x.title} ${x.company} ${x.skills.join(' ')}`.toLowerCase().includes(query.toLowerCase())).slice(0,5) : [], [query, opportunities])
  const pageName = navs[role]?.find((x) => location.pathname.startsWith(x[1]))?.[0] || 'Dashboard'
  const signOut = () => { logout().finally(() => navigate('/login')) }
  return <div className="min-h-screen bg-[#f5f7fb]"><Sidebar role={role} open={menu} onClose={() => setMenu(false)}/><div className="min-h-screen lg:pl-64">
    <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur md:px-6">
      <button onClick={() => setMenu(true)} className="btn-ghost px-2 lg:hidden" aria-label="Open navigation"><Menu size={22}/></button><div className="hidden min-w-32 sm:block"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace</p><p className="text-sm font-bold text-navy-900">{pageName}</p></div>
      <div className="relative mx-auto w-full max-w-xl"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} className="input bg-slate-50 pl-10 pr-12" placeholder="Search opportunities, companies, skills…" aria-label="Global search"/><span className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-1 text-[10px] text-slate-400 sm:flex"><Command size={10}/> K</span>
        {suggestions.length > 0 && <div className="absolute top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">{suggestions.map((item) => <button key={item.id} onClick={() => { navigate(`/student/opportunities/${item.id}`); setQuery('') }} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"><span><strong className="block text-sm text-navy-900">{item.title}</strong><small className="text-slate-500">{item.company} · {item.skills.slice(0,2).join(', ')}</small></span><ArrowRight size={16} className="text-slate-300"/></button>)}</div>}
      </div>
      <button onClick={() => navigate(role === 'student' ? '/student/messages' : `/${role}/messages`)} className="relative hidden h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 sm:grid" aria-label="Messages"><MessageSquare size={18}/></button>
      <button onClick={() => navigate(role === 'student' ? '/student/notifications' : `/${role}/dashboard`)} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label={`${unread} unread notifications`}><Bell size={18}/>{unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-bold text-white">{unread}</span>}</button>
      <div className="relative"><button onClick={() => setProfileOpen((x) => !x)} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-50"><ProfileAvatar initials={user?.initials}/><span className="hidden text-left xl:block"><strong className="block max-w-32 truncate text-xs text-navy-900">{user?.name}</strong><small className="text-[10px] text-slate-400">{user?.role}</small></span><ChevronDown size={14} className="hidden text-slate-400 md:block"/></button>{profileOpen && <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"><div className="border-b border-slate-100 px-3 py-2"><p className="text-sm font-bold text-navy-900">{user?.name}</p><p className="truncate text-xs text-slate-400">{user?.email}</p></div><button onClick={signOut} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"><LogOut size={16}/>Sign out</button></div>}</div>
    </header>
    <main className="animate-enter mx-auto max-w-[1536px] p-4 md:p-6 lg:p-8"><Outlet/></main>
  </div><ToastHost/></div>
}
