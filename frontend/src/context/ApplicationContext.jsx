import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { initialApplications, applicants as initialApplicants } from '../data/applications'
import { opportunities as seedOpportunities } from '../data/opportunities'

const ApplicationContext = createContext(null)

export function ApplicationProvider({ children }) {
  const [applications, setApplications] = useLocalStorage('skillbridge_applications', initialApplications)
  const [saved, setSaved] = useLocalStorage('skillbridge_saved', ['opp-3'])
  const [posted, setPosted] = useLocalStorage('skillbridge_posted_jobs', [])
  const [applicants, setApplicants] = useLocalStorage('skillbridge_applicants', initialApplicants)
  const opportunities = [...posted, ...seedOpportunities]

  const apply = (opportunity) => {
    if (applications.some((app) => app.opportunityId === opportunity.id)) return false
    setApplications((items) => [{ id: `app-${Date.now()}`, opportunityId: opportunity.id, company: opportunity.company, role: opportunity.title, appliedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), status: 'Applied', match: opportunity.match }, ...items])
    return true
  }
  const toggleSave = (id) => setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  const publish = (job, draft = false) => {
    const newJob = { ...job, id: `posted-${Date.now()}`, companyId: 'infosys', match: 84, posted: draft ? 'Draft' : 'Just now', skills: job.requiredSkills?.split(',').map((x) => x.trim()).filter(Boolean) || [], pay: job.pay || 'Competitive', mode: job.mode || 'Hybrid', type: job.type || 'Job', responsibilities: job.responsibilities?.split('\n').filter(Boolean) || [], status: draft ? 'Draft' : 'Active' }
    setPosted((items) => [newJob, ...items]); return newJob
  }
  const updateApplicant = (id, status) => setApplicants((items) => items.map((item) => item.id === id ? { ...item, status } : item))
  return <ApplicationContext.Provider value={{ applications, saved, posted, applicants, opportunities, apply, toggleSave, publish, updateApplicant }}>{children}</ApplicationContext.Provider>
}

export const useApplications = () => useContext(ApplicationContext)
