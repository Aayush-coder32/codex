import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Landmark,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { Logo } from '../../components/common/UI'
import { useAuth } from '../../context/AuthContext'
import { useUser } from '../../context/UserContext'
import campusImage from '../../assets/campus-hero.png'

const homeFor = (role) => `/${role}/dashboard`
const signupOptions = [
  { role: 'student', icon: GraduationCap, title: 'Student', text: 'Find internships, jobs and grow your skills.', color: 'bg-blue-50 text-blue-600' },
  { role: 'faculty', icon: Landmark, title: 'Faculty / Academia', text: 'Track student progress and collaborate with industry.', color: 'bg-violet-50 text-violet-600' },
  { role: 'company', icon: Building2, title: 'Industry / Company', text: 'Post opportunities and hire top talent.', color: 'bg-emerald-50 text-emerald-600' },
  { role: 'admin', icon: ShieldCheck, title: 'Administrator', text: 'Manage institutions, partners, users and platform insights.', color: 'bg-amber-50 text-amber-600' },
]

const loginRoles = [
  { value: 'student', label: 'Student', icon: GraduationCap },
  { value: 'faculty', label: 'Faculty', icon: Landmark },
  { value: 'company', label: 'Industry', icon: BriefcaseBusiness },
  { value: 'admin', label: 'Admin', icon: ShieldCheck },
]

function AicMark({ className = '' }) {
  return <span className={`relative block h-12 w-14 shrink-0 ${className}`} aria-hidden="true">
    <span className="absolute left-[22px] top-0 h-3 w-3 rounded-full bg-emerald-600" />
    <span className="absolute left-[4px] top-[9px] h-2.5 w-2.5 rounded-full bg-[#1d8aa0]" />
    <span className="absolute right-[4px] top-[9px] h-2.5 w-2.5 rounded-full bg-emerald-500" />
    <span className="absolute bottom-[2px] left-[20px] h-8 w-3 -rotate-[7deg] rounded-full rounded-tl-none bg-emerald-600" />
    <span className="absolute bottom-[5px] left-[5px] h-7 w-3 -rotate-[38deg] rounded-full bg-[#1d8aa0]" />
    <span className="absolute bottom-[5px] right-[6px] h-7 w-3 rotate-[38deg] rounded-full bg-emerald-500" />
  </span>
}

function AicBrand({ compact = false }) {
  return <div className="flex items-center gap-3">
    <AicMark />
    {!compact && <span>
      <strong className="block font-display text-[29px] font-extrabold leading-none tracking-[-.04em] text-[#102352]">AIC <span className="text-[#087d5a]">Connect</span></strong>
      <small className="mt-1 block text-[11px] font-medium tracking-[.015em] text-slate-600">Academia&nbsp; | &nbsp;Industry&nbsp; | &nbsp;Opportunities</small>
    </span>}
  </div>
}

const audienceHighlights = [
  { icon: GraduationCap, tone: 'bg-emerald-100 text-emerald-700', title: 'For Students', line1: 'Learn · Grow', line2: 'Get Hired' },
  { icon: Landmark, tone: 'bg-blue-100 text-blue-700', title: 'For Institutions', line1: 'Track · Guide', line2: 'Collaborate' },
  { icon: BriefcaseBusiness, tone: 'bg-orange-100 text-orange-600', title: 'For Industry', line1: 'Hire · Partner', line2: 'Innovate' },
  { icon: UsersRound, tone: 'bg-violet-100 text-violet-700', title: 'For Faculty', line1: 'Research · Mentor', line2: 'Create Impact' },
]

function LoginStory() {
  return <aside className="relative hidden min-h-screen overflow-hidden bg-[#eaf5fc] lg:flex lg:flex-col">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(255,255,255,.98),transparent_32%),linear-gradient(155deg,#f4fbff_0%,#e2f1fa_58%,#edf7f4_100%)]" />
    <img src={campusImage} alt="A modern academic campus" className="absolute inset-x-0 bottom-[82px] h-[41%] w-full object-cover object-[58%_58%]" />
    <div className="absolute inset-x-0 bottom-[82px] h-[45%] bg-gradient-to-b from-[#e8f4fb] via-transparent to-transparent" />

    <div className="relative z-10 px-[7.5%] pb-[118px] pt-7 xl:px-[8.5%] xl:pt-8">
      <AicBrand />

      <div className="mt-12 xl:mt-14">
        <p className="text-[10px] font-extrabold uppercase tracking-[.48em] text-slate-600">Together for a skilled India</p>
        <h1 className="mt-4 max-w-[600px] font-display text-[38px] font-extrabold leading-[1.14] tracking-[-.04em] text-[#0d2457] xl:text-[43px]">
          Bridging Academia<br />and Industry for<br />a <span className="text-[#087d5a]">Brighter Tomorrow</span>
        </h1>
        <p className="mt-4 max-w-[570px] text-[15px] leading-6 text-slate-700 xl:text-base">
          A unified platform for skill mapping, internships, placements and industry collaboration — empowering students, faculty and industry to co-create a skilled and future-ready India.
        </p>
      </div>

      <div className="mt-6 grid max-w-[590px] grid-cols-4 gap-3">
        {audienceHighlights.map(({ icon: Icon, tone, title, line1, line2 }) => <div key={title} className="text-center">
          <span className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${tone}`}><Icon size={23} strokeWidth={2.2} /></span>
          <strong className="mt-2 block text-[12px] font-extrabold text-[#102352] xl:text-[13px]">{title}</strong>
          <span className="mt-1 block text-[10px] leading-4 text-slate-600 xl:text-[11px]">{line1}<br />{line2}</span>
        </div>)}
      </div>

      <blockquote className="mt-7 max-w-[505px] rounded-2xl border border-white/70 bg-white/70 px-5 py-4 shadow-sm backdrop-blur-md xl:mt-8">
        <div className="flex gap-3">
          <span className="font-serif text-5xl font-bold leading-[.8] text-emerald-600">“</span>
          <div>
            <p className="font-serif text-[16px] font-semibold italic leading-6 text-[#17233e]">Building meaningful partnerships today for a skilled and healthier India tomorrow.</p>
            <footer className="mt-3 text-[11px] leading-4 text-slate-600"><strong className="text-[#17233e]">— Ministry of Ayush</strong><br />All India Institute of Ayurveda (AIIA)</footer>
          </div>
        </div>
      </blockquote>
    </div>

    <div className="absolute inset-x-0 bottom-0 z-20 grid h-[82px] grid-cols-4 bg-[#073b3e]/95 px-[6%] text-white backdrop-blur">
      {[
        { icon: UsersRound, value: '10K+', label: 'Students' },
        { icon: Landmark, value: '500+', label: 'Institutions' },
        { icon: BriefcaseBusiness, value: '300+', label: 'Industry Partners' },
        { icon: BarChart3, value: '5K+', label: 'Opportunities' },
      ].map(({ icon: Icon, value, label }) => <div className="flex items-center justify-center gap-2" key={label}>
        <Icon className="shrink-0 text-white" size={25} />
        <span><strong className="block text-[16px] leading-none xl:text-lg">{value}</strong><small className="mt-1 block whitespace-nowrap text-[9px] text-emerald-50 xl:text-[10px]">{label}</small></span>
      </div>)}
    </div>
  </aside>
}

function PartnerBadge({ variant, title, subtitle }) {
  return <div className="flex items-center gap-2.5">
    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 ${variant === 'government' ? 'border-slate-600 text-slate-700' : 'border-amber-500 bg-emerald-50 text-emerald-700'}`}>
      {variant === 'government' ? <Landmark size={22} /> : <BookOpen size={21} />}
    </span>
    <span><strong className="block text-[11px] font-extrabold leading-[1.15] text-slate-800">{title}</strong><small className="mt-0.5 block text-[9px] text-slate-500">{subtitle}</small></span>
  </div>
}

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
  const [selectedRole, setSelectedRole] = useState('student')
  const [passwordVisible, setPasswordVisible] = useState(false)
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
      const session = await login({
        email: form.get('email'),
        password: form.get('password'),
        role: selectedRole,
      })
      toast(`Welcome back, ${session.user.name}`)
      navigate(homeFor(session.role), { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return <div className="min-h-screen bg-[#fbfcfd] text-[#14213d] lg:grid lg:grid-cols-2">
    <LoginStory />

    <main className="flex min-h-screen flex-col px-5 py-5 sm:px-8 lg:px-[7%] lg:py-7 xl:px-[9%]">
      <div className="flex items-center justify-between gap-4">
        <div className="lg:hidden"><span className="hidden sm:block"><AicBrand /></span><span className="sm:hidden"><AicBrand compact /></span></div>
        <div className="ml-auto flex items-center gap-3 text-[12px] sm:text-[13px]">
          <span className="hidden text-slate-500 sm:inline">Don’t have an account?</span>
          <Link to="/signup" className="group inline-flex items-center gap-3 font-bold text-[#087d5a]">Create Account <ArrowRight size={17} className="transition group-hover:translate-x-1" /></Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center py-7">
        <section className="mx-auto w-full max-w-[650px] rounded-[22px] border border-slate-100 bg-white px-5 py-7 shadow-[0_12px_42px_rgba(24,46,76,.09)] sm:px-9 sm:py-8 xl:px-10 xl:py-9" aria-labelledby="login-heading">
          <h1 id="login-heading" className="font-display text-[28px] font-extrabold leading-tight tracking-[-.035em] text-[#102352] sm:text-[32px]">Welcome to <span className="text-[#087d5a]">AIC Connect</span></h1>
          <p className="mt-1 text-[15px] text-slate-500 sm:text-base">Login to continue your journey</p>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Choose your account type">
            {loginRoles.map(({ value, label, icon: Icon }) => {
              const active = selectedRole === value
              return <button
                type="button"
                key={value}
                aria-pressed={active}
                onClick={() => setSelectedRole(value)}
                className={`group flex min-h-[86px] flex-col items-center justify-center rounded-lg border px-2 py-3 text-center transition focus:outline-none focus:ring-4 focus:ring-emerald-100 ${active ? 'border-emerald-600 bg-emerald-50/60 text-emerald-700 shadow-sm' : 'border-slate-100 bg-[#fafbfd] text-[#35476b] hover:border-emerald-200 hover:bg-emerald-50/30'}`}
              >
                <Icon size={27} fill={value === 'admin' ? 'currentColor' : 'none'} strokeWidth={2.2} />
                <span className={`mt-2 text-[13px] font-bold ${active ? 'text-[#12213f]' : 'text-[#263654]'}`}>{label}</span>
              </button>
            })}
          </div>

          <form className="mt-5 space-y-4" onSubmit={submit}>
            <FormError message={error} />
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-bold text-[#14213d]">Email Address / Username</span>
              <span className="relative block">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input required name="email" type="email" autoComplete="email" placeholder="Enter your email or username" className="h-[49px] w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
              </span>
            </label>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor="login-password" className="text-[13px] font-bold text-[#14213d]">Password</label>
                <Link to="/forgot-password" className="text-[12px] font-bold text-[#087d5a] transition hover:text-emerald-700">Forgot Password?</Link>
              </div>
              <span className="relative block">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input id="login-password" required name="password" type={passwordVisible ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" className="h-[49px] w-full rounded-lg border border-slate-300 bg-white pl-12 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" aria-label={passwordVisible ? 'Hide password' : 'Show password'} onClick={() => setPasswordVisible((visible) => !visible)}>{passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-slate-500">
              <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-[#35415a]"><input name="remember" type="checkbox" defaultChecked className="h-5 w-5 rounded accent-emerald-600" />Remember me</label>
              <span>Use a secure device</span>
            </div>

            <button disabled={loading} className="group inline-flex h-[54px] w-full items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-[#047451] to-[#18b978] px-5 text-base font-bold text-white shadow-[0_9px_22px_rgba(5,132,89,.18)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(5,132,89,.25)] focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Signing you in…' : 'Login'}<ArrowRight size={20} className="transition group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-[#eefaf6] px-4 py-4 text-[#087d5a]">
            <ShieldCheck className="shrink-0" size={31} fill="currentColor" stroke="white" />
            <div><strong className="block text-[12px] font-extrabold">Your data is secure with us.</strong><p className="mt-0.5 text-[10px] leading-4 text-slate-600 sm:text-[11px]">We follow industry-standard security practices to protect your information.</p></div>
          </div>
        </section>

        <div className="mx-auto mt-6 flex w-full max-w-[600px] flex-col items-center justify-between gap-4 px-2 sm:flex-row">
          <PartnerBadge variant="government" title={<>MINISTRY OF<br /><span className="text-[16px]">AYUSH</span></>} subtitle="Government of India" />
          <PartnerBadge title={<>All India Institute<br />of Ayurveda (AIIA)</>} subtitle="आयुर्वेदः सर्वभूतानाम्" />
        </div>
      </div>

      <footer className="mx-auto flex w-full max-w-[650px] flex-col items-center justify-between gap-3 text-[10px] text-slate-500 sm:flex-row">
        <p>© 2026 AIC Connect. All rights reserved.</p>
        <nav className="flex items-center gap-4" aria-label="Legal"><a href="#terms" className="hover:text-slate-800">Terms</a><span className="text-slate-300">|</span><a href="#privacy" className="hover:text-slate-800">Privacy</a><span className="text-slate-300">|</span><a href="mailto:support@aicconnect.in" className="hover:text-slate-800">Contact</a></nav>
      </footer>
    </main>
  </div>
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
        name: String(form.get('name') || '').trim(),
        email: String(form.get('email') || '').trim().toLowerCase(),
        password: String(form.get('password') || ''),
        role: String(selectedRole || '').trim().toLowerCase(),
        ...(selectedRole === 'company' ? { organizationName: String(form.get('organizationName') || '').trim() } : {}),
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
