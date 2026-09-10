import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, BriefcaseBusiness, Clock3, MapPin, WalletCards, ArrowUpRight } from 'lucide-react'
import { ConfirmDialog, SkillChip } from '../common/UI'
import { useApplications } from '../../context/ApplicationContext'
import { useUser } from '../../context/UserContext'
import { companies } from '../../data/companies'

export default function OpportunityCard({ opportunity, compact = false }) {
  const { applications, saved, apply, toggleSave } = useApplications()
  const { toast } = useUser()
  const [confirm, setConfirm] = useState(false)
  const applied = applications.some((app) => app.opportunityId === opportunity.id)
  const isSaved = saved.includes(opportunity.id)
  const company = companies.find((x) => x.id === opportunity.companyId)
  const doApply = () => { const ok = apply(opportunity); toast(ok ? `Application sent to ${opportunity.company}` : 'You have already applied to this opportunity', ok ? 'success' : 'error') }
  return <article className="card group flex h-full flex-col p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
    <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xs font-extrabold text-white ${company?.color || 'bg-blue-600'}`}>{company?.initials || opportunity.company.slice(0,2)}</span><div className="min-w-0"><p className="truncate text-xs font-bold uppercase tracking-wider text-slate-400">{opportunity.company}</p><h3 className="mt-0.5 line-clamp-2 font-bold leading-5 text-navy-900">{opportunity.title}</h3></div></div><button type="button" onClick={() => { toggleSave(opportunity.id); toast(isSaved ? 'Removed from saved opportunities' : 'Opportunity saved') }} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition ${isSaved ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-400 hover:text-blue-600'}`} aria-label={isSaved ? 'Remove saved opportunity' : 'Save opportunity'}><Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'}/></button></div>
    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500"><span className="inline-flex items-center gap-1.5"><MapPin size={14}/>{opportunity.location}</span><span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={14}/>{opportunity.type}</span><span className="inline-flex items-center gap-1.5"><WalletCards size={14}/>{opportunity.pay}</span>{!compact && <span className="inline-flex items-center gap-1.5"><Clock3 size={14}/>{opportunity.duration}</span>}</div>
    <div className="mt-4 flex flex-wrap gap-1.5">{opportunity.skills.slice(0, compact ? 3 : 4).map((skill) => <SkillChip key={skill} tone="slate">{skill}</SkillChip>)}</div>
    <div className="mt-auto pt-5"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-slate-400">Profile compatibility</span><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${opportunity.match >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{opportunity.match}% match</span></div><div className="h-1.5 rounded-full bg-slate-100"><div className={`h-full rounded-full ${opportunity.match >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{width:`${opportunity.match}%`}}/></div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2"><button disabled={applied} onClick={() => setConfirm(true)} className="btn-primary">{applied ? 'Applied' : 'Apply now'}<ArrowUpRight size={16}/></button><Link className="btn-secondary px-3" to={`/student/opportunities/${opportunity.id}`} aria-label={`View ${opportunity.title}`}><span className="hidden sm:inline">Details</span><ArrowUpRight size={16}/></Link></div>
    </div>
    <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={doApply} title="Submit your application?" message={`Your SkillBridge profile and selected resume will be shared with ${opportunity.company} for the ${opportunity.title} role.`} confirmLabel="Submit application" />
  </article>
}
