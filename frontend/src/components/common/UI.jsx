import { useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Inbox, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useUser } from '../../context/UserContext'

export function Logo({ compact = false, dark = false }) {
  return <div className="flex items-center gap-2.5">
    <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-900/20" aria-hidden="true">
      <span className="absolute h-4 w-5 -rotate-6 rounded-sm border-2 border-white/95" />
      <span className="absolute mt-3 h-1.5 w-5 rounded-b bg-white/95" />
    </span>
    {!compact && <span className={`font-display text-xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-navy-900'}`}>Skill<span className="text-blue-500">Bridge</span></span>}
  </div>
}

export function ProfileAvatar({ initials = 'AS', size = 'md', online = false, className = '' }) {
  const sizes = { sm: 'h-9 w-9 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-20 w-20 text-xl', xl: 'h-24 w-24 text-2xl' }
  return <span className={`relative inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 font-bold text-blue-700 ring-2 ring-white ${sizes[size]} ${className}`}>
    {initials}{online && <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />}
  </span>
}

export function PageHeader({ eyebrow, title, description, children }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>{eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}<h1 className="text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">{title}</h1>{description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}</div>
    {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
  </div>
}

export function StatCard({ label, value, detail, icon: Icon, tone = 'blue', trend }) {
  const tones = { blue: 'bg-blue-50 text-blue-600', green: 'bg-emerald-50 text-emerald-600', purple: 'bg-violet-50 text-violet-600', orange: 'bg-amber-50 text-amber-600', red: 'bg-rose-50 text-rose-600' }
  return <div className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
    <div className="flex items-start justify-between"><div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone] || tones.blue}`}><Icon size={20} /></div>{trend && <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{trend}</span>}</div>
    <p className="mt-5 text-2xl font-extrabold text-navy-900">{value}</p><p className="mt-0.5 text-sm font-medium text-slate-500">{label}</p>{detail && <p className="mt-2 text-xs text-slate-400">{detail}</p>}
  </div>
}

export function StatusBadge({ status }) {
  const value = status || 'Active'
  const key = value.toLowerCase()
  const style = key.includes('selected') || key.includes('complete') || key.includes('active') || key.includes('ready') || key.includes('hired') ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15' : key.includes('reject') ? 'bg-rose-50 text-rose-700 ring-rose-600/15' : key.includes('interview') || key.includes('progress') || key.includes('review') ? 'bg-amber-50 text-amber-700 ring-amber-600/15' : key.includes('shortlist') || key.includes('recommend') ? 'bg-violet-50 text-violet-700 ring-violet-600/15' : key.includes('lock') || key.includes('upcoming') || key.includes('draft') ? 'bg-slate-100 text-slate-600 ring-slate-500/15' : 'bg-blue-50 text-blue-700 ring-blue-600/15'
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${style}`}>{value}</span>
}

export function SkillChip({ children, onRemove, tone = 'blue' }) {
  const styles = tone === 'slate' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-700'
  return <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${styles}`}>{children}{onRemove && <button type="button" aria-label={`Remove ${children}`} onClick={onRemove} className="ml-0.5 rounded hover:bg-black/5"><X size={12} /></button>}</span>
}

export function ProgressRing({ value, size = 104, stroke = 9, label, color = '#2563eb' }) {
  const radius = (size - stroke) / 2, circumference = radius * 2 * Math.PI
  return <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true"><circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e8edf5" strokeWidth={stroke} /><circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} /></svg>
    <span className="absolute text-center"><strong className="block text-xl font-extrabold text-navy-900">{value}%</strong>{label && <small className="text-[10px] font-semibold text-slate-400">{label}</small>}</span>
  </div>
}

export function SkillProgress({ name, value, required, color = 'bg-blue-600' }) {
  return <div><div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-slate-700">{name}</span><span className="font-bold text-slate-500">{value}%</span></div><div className="relative h-2 rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />{required && <span className="absolute -top-1 h-4 w-0.5 bg-slate-700" style={{ left: `${required}%` }} title={`Required: ${required}%`} />}</div>{required && <div className="mt-1 text-right text-[10px] text-slate-400">Required {required}%</div>}</div>
}

export function Tabs({ tabs, value, onChange }) {
  return <div className="scrollbar-thin flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" role="tablist">{tabs.map((tab) => <button type="button" role="tab" aria-selected={value === tab} key={tab} onClick={() => onChange(tab)} className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition ${value === tab ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{tab}</button>)}</div>
}

export function Modal({ open, onClose, title, description, children, size = 'md' }) {
  useEffect(() => { const onKey = (e) => e.key === 'Escape' && onClose(); if (open) document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey) }, [open, onClose])
  if (!open) return null
  return <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-navy-950/55 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={title}>
    <div className={`animate-enter my-auto w-full ${size === 'lg' ? 'max-w-3xl' : size === 'xl' ? 'max-w-5xl' : 'max-w-lg'} rounded-2xl bg-white shadow-2xl`}>
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-lg font-bold text-navy-900">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div><button type="button" className="btn-ghost -mr-2 -mt-1" onClick={onClose} aria-label="Close dialog"><X size={19}/></button></div>
      <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
    </div>
  </div>
}

export function ConfirmDialog({ open, onClose, title, message, confirmLabel = 'Confirm', onConfirm }) {
  return <Modal open={open} onClose={onClose} title={title}><p className="mb-6 text-sm leading-6 text-slate-600">{message}</p><div className="flex justify-end gap-2"><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</button></div></Modal>
}

export function EmptyState({ title = 'Nothing here yet', message = 'New items will appear here when available.', icon: Icon = Inbox, action }) {
  return <div className="grid min-h-64 place-items-center p-8 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Icon size={25}/></span><h3 className="mt-4 font-bold text-navy-900">{title}</h3><p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{message}</p>{action && <div className="mt-4">{action}</div>}</div></div>
}

export function LoadingSkeleton() { return <div className="animate-pulse space-y-4"><div className="h-8 w-1/3 rounded-lg bg-slate-200"/><div className="grid grid-cols-3 gap-4">{[1,2,3].map((x)=><div key={x} className="h-32 rounded-2xl bg-slate-200"/>)}</div><div className="h-72 rounded-2xl bg-slate-200"/></div> }

export function ChartCard({ title, description, children, action }) { return <section className="card min-w-0 p-5"><div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="font-bold text-navy-900">{title}</h2>{description && <p className="mt-1 text-xs text-slate-500">{description}</p>}</div>{action}</div>{children}</section> }

export function Pagination({ page = 1, total = 1, onChange = () => {} }) { return <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500"><span>Page {page} of {total}</span><div className="flex gap-1"><button className="btn-ghost" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={17}/></button><button className="btn-ghost" aria-label="Next page" disabled={page >= total} onClick={() => onChange(page + 1)}><ChevronRight size={17}/></button></div></div> }

export function Field({ label, error, ...props }) { return <label className="block"><span className="label">{label}</span><input className="input" {...props}/>{error && <span className="mt-1 text-xs text-rose-600">{error}</span>}</label> }
export function SelectField({ label, children, ...props }) { return <label className="block"><span className="label">{label}</span><select className="input" {...props}>{children}</select></label> }
export function TextareaField({ label, ...props }) { return <label className="block"><span className="label">{label}</span><textarea className="input min-h-28 resize-y" {...props}/></label> }
export function ExternalTextLink({ href, children }) { return <a className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline" href={href} target="_blank" rel="noreferrer">{children}<ExternalLink size={13}/></a> }

export function ToastHost() {
  const { toasts } = useUser()
  return <div className="fixed bottom-5 right-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-2" aria-live="polite">{toasts.map((item) => <div key={item.id} className={`animate-toast flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${item.tone === 'error' ? 'border-rose-200' : 'border-emerald-200'}`}>{item.tone === 'error' ? <AlertCircle className="mt-0.5 text-rose-500" size={19}/> : <CheckCircle2 className="mt-0.5 text-emerald-500" size={19}/>}<p className="text-sm font-semibold text-slate-700">{item.message}</p></div>)}</div>
}
