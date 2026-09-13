import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Landing from './pages/public/Landing'
import PublicOpportunities from './pages/public/PublicOpportunities'
import { ForgotPassword, Login, Signup } from './pages/auth/AuthPages'
import AppShell from './components/layout/AppShell'
import { useAuth } from './context/AuthContext'
import { StudentDashboard, StudentProfile, SkillAnalysis, StudentRoadmap, StudentOpportunities, OpportunityDetails, StudentApplications, ProjectsPage, CertificatesPage, LeetCodePage, LinkedInResumePage } from './pages/student/StudentPages'
import { FacultyAnalytics, FacultyCollaboration, FacultyCollaborationDetail, FacultyDashboard, FacultyReports, FacultyStudents, FacultyTraining } from './pages/faculty/FacultyPages'
import { CompanyAnalytics, CompanyApplications, CompanyDashboard, CompanyProfile, FindStudents, ManageOpportunities, PostOpportunity } from './pages/company/CompanyPages'
import { AdminAnnouncements, AdminApplications, AdminCompanies, AdminDashboard, AdminInstitutions, AdminOpportunities, AdminReports, AdminStudents } from './pages/admin/AdminPages'
import { MessagesPage, NotificationsPage, SettingsPage } from './pages/shared/SharedPages'
import { EmptyState, ToastHost } from './components/common/UI'
import { Compass } from 'lucide-react'

function RequireRole({ role, children }) {
  const { session, initializing } = useAuth()
  const location = useLocation()
  if (initializing) return <AuthLoading/>
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (session.role !== role) return <Navigate to={`/${session.role}/dashboard`} replace />
  return children
}

function RoleHome() {
  const { session, initializing } = useAuth()
  if (initializing) return <AuthLoading/>
  return <Navigate replace to={session ? `/${session.role}/dashboard` : '/login'} />
}

function AuthLoading() {
  return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="text-center"><span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"/><p className="mt-3 text-sm font-semibold text-slate-500">Checking your session…</p></div></div>
}

function NotFound() {
  return <div className="grid min-h-screen place-items-center bg-slate-50 p-4"><div className="card w-full max-w-lg"><EmptyState icon={Compass} title="That page isn’t on the map" message="The link may be outdated, or the page may have moved." action={<a href="/" className="btn-primary">Return to SkillBridge</a>}/></div><ToastHost/></div>
}

export default function App() {
  return <Routes>
    <Route path="/" element={<Landing/>}/>
    <Route path="/opportunities" element={<PublicOpportunities/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/signup" element={<Signup/>}/>
    <Route path="/forgot-password" element={<ForgotPassword/>}/>
    <Route path="/dashboard" element={<RoleHome/>}/>

    <Route element={<RequireRole role="student"><AppShell role="student"/></RequireRole>}>
      <Route path="/student/dashboard" element={<StudentDashboard/>}/>
      <Route path="/student/profile" element={<StudentProfile/>}/>
      <Route path="/student/skill-analysis" element={<SkillAnalysis/>}/>
      <Route path="/student/roadmap" element={<StudentRoadmap/>}/>
      <Route path="/student/opportunities" element={<StudentOpportunities/>}/>
      <Route path="/student/opportunities/:id" element={<OpportunityDetails/>}/>
      <Route path="/student/applications" element={<StudentApplications/>}/>
      <Route path="/student/leetcode" element={<LeetCodePage/>}/>
      <Route path="/student/linkedin-resume" element={<LinkedInResumePage/>}/>
      <Route path="/student/projects" element={<ProjectsPage/>}/>
      <Route path="/student/certificates" element={<CertificatesPage/>}/>
      <Route path="/student/messages" element={<MessagesPage/>}/>
      <Route path="/student/notifications" element={<NotificationsPage/>}/>
      <Route path="/student/settings" element={<SettingsPage/>}/>
    </Route>

    <Route element={<RequireRole role="faculty"><AppShell role="faculty"/></RequireRole>}>
      <Route path="/faculty/dashboard" element={<FacultyDashboard/>}/>
      <Route path="/faculty/students" element={<FacultyStudents/>}/>
      <Route path="/faculty/analytics" element={<FacultyAnalytics/>}/>
      <Route path="/faculty/training" element={<FacultyTraining/>}/>
      <Route path="/faculty/collaboration" element={<FacultyCollaboration/>}/>
      <Route path="/faculty/collaboration/:companyId" element={<FacultyCollaborationDetail/>}/>
      <Route path="/faculty/communications" element={<MessagesPage/>}/>
      <Route path="/faculty/reports" element={<FacultyReports/>}/>
      <Route path="/faculty/settings" element={<SettingsPage/>}/>
    </Route>

    <Route element={<RequireRole role="company"><AppShell role="company"/></RequireRole>}>
      <Route path="/company/dashboard" element={<CompanyDashboard/>}/>
      <Route path="/company/post-opportunity" element={<PostOpportunity/>}/>
      <Route path="/company/opportunities" element={<ManageOpportunities/>}/>
      <Route path="/company/applications" element={<CompanyApplications/>}/>
      <Route path="/company/students" element={<FindStudents/>}/>
      <Route path="/company/analytics" element={<CompanyAnalytics/>}/>
      <Route path="/company/messages" element={<MessagesPage/>}/>
      <Route path="/company/profile" element={<CompanyProfile/>}/>
      <Route path="/company/settings" element={<SettingsPage/>}/>
    </Route>

    <Route element={<RequireRole role="admin"><AppShell role="admin"/></RequireRole>}>
      <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
      <Route path="/admin/institutions" element={<AdminInstitutions/>}/>
      <Route path="/admin/companies" element={<AdminCompanies/>}/>
      <Route path="/admin/students" element={<AdminStudents/>}/>
      <Route path="/admin/opportunities" element={<AdminOpportunities/>}/>
      <Route path="/admin/applications" element={<AdminApplications/>}/>
      <Route path="/admin/reports" element={<AdminReports/>}/>
      <Route path="/admin/announcements" element={<AdminAnnouncements/>}/>
      <Route path="/admin/settings" element={<SettingsPage/>}/>
    </Route>
    <Route path="*" element={<NotFound/>}/>
  </Routes>
}
