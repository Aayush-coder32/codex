import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Landmark,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react'
import { Logo } from '../../components/common/UI'
import { useAuth } from '../../context/AuthContext'
import { useUser } from '../../context/UserContext'

const homeFor = (role) => `/${role}/dashboard`
const signupOptions = [
  { role: 'student', icon: GraduationCap, title: 'Student', text: 'Find internships, jobs and grow your skills.', color: 'bg-blue-50 text-blue-600' },
  { role: 'faculty', icon: Landmark, title: 'Faculty / Academia', text: 'Track student progress and collaborate with industry.', color: 'bg-violet-50 text-violet-600' },
  { role: 'company', icon: Building2, title: 'Industry / Company', text: 'Post opportunities and hire top talent.', color: 'bg-emerald-50 text-emerald-600' },
]

function AuthLayout({ children, heading, subheading }) {
  return <div className="grid min-h-screen bg-white lg:grid-cols-[.9fr_1.1fr]">
    <aside className="relative hidden overflow-hidden bg-navy-900 p-12 text-white lg:flex lg:flex-col">
      <div className="absolute inset-0 hero-grid opacity-10"/>
      <div className="absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl"/>
      <Link className="relative" to="/"><Logo dark/></Link>
      <div className="relative my-auto max-w-lg">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/20 text-blue-300"><LockKeyhole size={26}/></span>
        <h1 className="mt-7 text-4xl font-extrabold leading-tight">One secure workspace.<br/><span className="text-blue-300">A world of opportunity.</span></h1>
        <p className="mt-5 leading-7 text-slate-300">Connect skills, education and hiring outcomes through a trusted collaboration network.</p>
        <div className="mt-10 grid grid-cols-3 gap-3">{[['10K+','Learners'],['500+','Campuses'],['1K+','Partners']].map(([value,label]) => <div className="rounded-xl border border-white/10 bg-white/[.06] p-4" key={label}><b className="block text-xl">{value}</b><span className="text-xs text-slate-400">{label}</span></div>)}</div>
      </div>
      <p className="relative text-xs text-slate-500">© 2026 SkillBridge · Secure account access</p>
    </aside>
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-between lg:hidden"><Link to="/"><Logo/></Link><Link to="/" className="btn-ghost"><ArrowLeft size={16}/>Home</Link></div>
        <h1 className="text-3xl font-extrabold text-navy-900">{heading}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{subheading}</p>
        {children}
      </div>
    </main>
  </div>
}

function FormError({ message }) {
  if (!message) return null
  return <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 shrink-0" size={17}/><span>{message}</span></div>
}

function IconField({ label, icon: Icon, ...props }) {
  return <label className="block">
    <span className="label">{label}</span>
    <span className="relative block"><Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input className="input pl-10" {...props}/></span>
  </label>
}

function PasswordField({ label, ...props }) {
  const [visible, setVisible] = useState(false)
  return <label className="block">
    <span className="label">{label}</span>
    <span className="relative block">
      <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17}/>
      <input className="input pl-10 pr-11" type={visible ? 'text' : 'password'} {...props}/>
      <button type="button" onClick={() => setVisible((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700" aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
    </span>
  </label>
}

export function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const { toast } = useUser()
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const session = await login({ email: form.get('email'), password: form.get('password') })
      toast(`Welcome back, ${session.user.name}`)
      navigate(homeFor(session.role))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return <AuthLayout heading="Welcome back" subheading="Sign in with your registered SkillBridge account.">
    <form className="mt-8 space-y-4" onSubmit={submit}>
      <FormError message={error}/>
      <IconField required name="email" label="Email address" type="email" autoComplete="email" placeholder="you@example.com" icon={Mail}/>
      <PasswordField required name="password" label="Password" autoComplete="current-password" placeholder="Enter your password"/>
      <div className="flex justify-end text-sm"><Link to="/forgot-password" className="font-semibold text-brand-600 hover:text-brand-700">Forgot password?</Link></div>
      <button disabled={loading} className="btn-primary w-full">{loading ? 'Signing you in…' : 'Sign in'}<ArrowRight size={16}/></button>
    </form>
    <p className="mt-7 text-center text-sm text-slate-500">New to SkillBridge? <Link className="font-bold text-brand-600" to="/signup">Create an account</Link></p>
  </AuthLayout>
}

export function Signup() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const { toast } = useUser()
  const navigate = useNavigate()
  const selected = signupOptions.find((option) => option.role === selectedRole)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    if (form.get('password') !== form.get('confirmPassword')) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const details = {
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
        role: selectedRole,
        ...(selectedRole === 'company' ? { organizationName: form.get('organizationName') } : {}),
      }
      const session = await register(details)
      toast('Your SkillBridge account is ready')
      navigate(homeFor(session.role))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  if (!selectedRole) return <AuthLayout heading="Join the SkillBridge network" subheading="First, tell us how you want to use the platform.">
    <div className="mt-8 space-y-3">{signupOptions.map(({ role, icon: Icon, title, text, color }) => <button type="button" onClick={() => { setSelectedRole(role); setError('') }} key={role} className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-soft focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${color}`}><Icon size={22}/></span>
      <span className="min-w-0 flex-1"><strong className="block text-base text-navy-900">{title}</strong><span className="mt-1 block text-sm text-slate-500">{text}</span></span>
      <ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-600" size={19}/>
    </button>)}</div>
    <p className="mt-7 text-center text-sm text-slate-500">Already have an account? <Link className="font-bold text-brand-600" to="/login">Sign in</Link></p>
  </AuthLayout>

  return <AuthLayout heading={`Create your ${selected.title} account`} subheading="Tell us a little about yourself to get started.">
    <button type="button" onClick={() => { setSelectedRole(null); setError('') }} className="btn-ghost -ml-3 mt-4"><ArrowLeft size={16}/>Change account type</button>
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
      <span className={`grid h-10 w-10 place-items-center rounded-lg ${selected.color}`}><selected.icon size={19}/></span>
      <span><strong className="block text-sm text-navy-900">{selected.title}</strong><span className="text-xs text-slate-500">Selected account type</span></span>
      <Check className="ml-auto text-blue-600" size={18}/>
    </div>
    <form className="mt-5 space-y-4" onSubmit={submit}>
      <FormError message={error}/>
      <IconField required name="name" label="Full name" autoComplete="name" placeholder="Your full name" icon={UserRound}/>
      <IconField required name="email" label="Email address" type="email" autoComplete="email" placeholder="you@example.com" icon={Mail}/>
      {selectedRole === 'company' && <IconField required name="organizationName" label="Company name" autoComplete="organization" placeholder="Your organization" icon={Building2}/>} 
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField required minLength="8" name="password" label="Password" autoComplete="new-password" placeholder="At least 8 characters"/>
        <PasswordField required minLength="8" name="confirmPassword" label="Confirm password" autoComplete="new-password" placeholder="Repeat password"/>
      </div>
      <label className="flex items-start gap-2.5 text-sm leading-5 text-slate-600"><input required name="terms" type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-blue-600"/><span>I agree to the <a href="#terms" className="font-semibold text-brand-600">Terms of Service</a> and <a href="#privacy" className="font-semibold text-brand-600">Privacy Policy</a>.</span></label>
      <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating your account…' : 'Create account'}<ArrowRight size={16}/></button>
    </form>
    <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link className="font-bold text-brand-600" to="/login">Sign in</Link></p>
  </AuthLayout>
}

export function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { forgotPassword } = useAuth()

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const form = new FormData(event.currentTarget)
      await forgotPassword(form.get('email'))
      setSent(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return <AuthLayout heading={sent ? 'Check your inbox' : 'Reset your password'} subheading={sent ? 'If this address is registered, a reset link is ready.' : 'Enter your account email and we’ll prepare a secure reset link.'}>
    {sent ? <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-emerald-600"><Mail/></span><p className="mt-4 text-sm text-emerald-800">You can now return to sign in.</p><Link to="/login" className="btn-primary mt-5">Back to login</Link></div> : <form className="mt-8 space-y-5" onSubmit={submit}><FormError message={error}/><IconField required name="email" label="Email address" type="email" autoComplete="email" placeholder="you@example.com" icon={Mail}/><button disabled={loading} className="btn-primary w-full">{loading ? 'Preparing link…' : 'Send reset link'}<ArrowRight size={16}/></button><Link to="/login" className="btn-ghost w-full"><ArrowLeft size={16}/>Back to login</Link></form>}
  </AuthLayout>
}
