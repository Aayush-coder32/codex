import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CirclePlay,
  Facebook,
  GraduationCap,
  Handshake,
  Instagram,
  Landmark,
  Mail,
  MapPin,
  Linkedin,
  Menu,
  Rocket,
  Sparkles,
  TrendingUp,
  Twitter,
  Phone,
  FileText,
  Video,
  UsersRound,
  X,
  Youtube,
} from 'lucide-react'
import { Modal } from '../../components/common/UI'
import heroImage from '../../assets/campus-hero.png'
import impactImage from '../../assets/impact-mountains.png'

const navItems = [
  ['Home', 'home'],
  ['About', 'about'],
  ['For Students', 'students'],
  ['For Institutions', 'institutions'],
  ['For Industry', 'industry'],
  ['Resources', 'resources'],
  ['Contact', 'contact'],
]

const audienceCards = [
  {
    id: 'students',
    icon: GraduationCap,
    title: 'For Students',
    text: 'Build your skill profile, get personalized recommendations, and find internships & placements.',
    className: 'bg-[#eaf6ff]',
    iconClass: 'bg-sky-100 text-sky-600',
  },
  {
    id: 'institutions',
    icon: Landmark,
    title: 'For Institutions',
    text: 'Track student progress, enable industry exposure, and strengthen academia-industry ties.',
    className: 'bg-[#fff0e7]',
    iconClass: 'bg-rose-100 text-[#a9575d]',
  },
  {
    id: 'industry',
    icon: BriefcaseBusiness,
    title: 'For Industry',
    text: 'Find skilled talent, post opportunities, and collaborate with top institutions.',
    className: 'bg-[#e5fbef]',
    iconClass: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'faculty',
    icon: UsersRound,
    title: 'For Faculty',
    text: 'Access industry projects, collaborate on research, and enhance professional growth.',
    className: 'bg-[#f1eaff]',
    iconClass: 'bg-violet-100 text-violet-600',
  },
]

const heroPromises = [
  { icon: GraduationCap, title: 'Learn', text: 'Discover your skill potential' },
  { icon: BarChart3, title: 'Grow', text: 'Get industry-relevant opportunities' },
  { icon: UsersRound, title: 'Collaborate', text: 'Build a brighter future together' },
]

const impactStats = [
  { icon: Rocket, value: '85%', label: 'Placement Success', detail: '(Partner Institutions)' },
  { icon: TrendingUp, value: '3x', label: 'Higher Internship', detail: 'Opportunities' },
  { icon: BarChart3, value: '40%', label: 'Reduced Skill Gap', detail: '' },
  { icon: Sparkles, value: '100+', label: 'Industry Projects', detail: 'Enabled' },
]

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative grid h-11 w-11 place-items-center" aria-hidden="true">
        <span className="absolute h-9 w-9 rounded-full border-2 border-emerald-300/70" />
        <Handshake className="relative text-emerald-300" size={29} strokeWidth={1.8} />
      </span>
      <span>
        <b className="block font-display text-[21px] font-extrabold leading-none tracking-tight text-white">SkillBridge</b>
        <small className="mt-1 block text-[10px] font-semibold tracking-[.08em] text-slate-300">Bridge · Build · Bloom</small>
      </span>
    </div>
  )
}

export default function Landing() {
  const [navOpen, setNavOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeNav = () => setNavOpen(false)

  return (
    <div className="landing-aic min-h-screen overflow-x-hidden bg-white text-[#102044]">
      <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${scrolled || navOpen ? 'border-white/10 bg-[#061d29]/95 shadow-lg backdrop-blur-xl' : 'border-white/10 bg-[#061d29]/55 backdrop-blur-md'}`}>
        <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-5 lg:px-8">
          <a href="#home" aria-label="SkillBridge home" onClick={closeNav}><Brand /></a>

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
            {navItems.map(([label, id], index) => (
              <a key={id} href={`#${id}`} className={`relative rounded-lg px-3 py-2 text-[12px] font-semibold text-white/80 transition hover:text-white ${index === 0 ? 'after:absolute after:inset-x-3 after:-bottom-3 after:h-0.5 after:rounded-full after:bg-emerald-300' : ''}`}>
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <Link to="/login" className="inline-flex h-10 min-w-[88px] items-center justify-center rounded-lg border border-emerald-200/35 bg-[#092b36]/70 px-5 text-xs font-bold text-white transition hover:border-emerald-200/70 hover:bg-white/10">Login</Link>
            <Link to="/signup" className="inline-flex h-10 min-w-[104px] items-center justify-center rounded-lg bg-emerald-300 px-5 text-xs font-extrabold text-[#07313a] shadow-lg shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-emerald-200">Get Started</Link>
          </div>

          <button type="button" className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-white xl:hidden" aria-expanded={navOpen} aria-label="Toggle navigation" onClick={() => setNavOpen((value) => !value)}>
            {navOpen ? <X size={21} /> : <Menu size={22} />}
          </button>
        </div>

        {navOpen && (
          <div className="border-t border-white/10 bg-[#061d29] px-5 pb-6 pt-3 xl:hidden">
            <nav className="mx-auto grid max-w-[1180px] gap-1">
              {navItems.map(([label, id]) => <a key={id} href={`#${id}`} onClick={closeNav} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/5 hover:text-white">{label}</a>)}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link to="/login" className="inline-flex h-11 items-center justify-center rounded-lg border border-white/20 text-sm font-bold text-white">Login</Link>
                <Link to="/signup" className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-300 text-sm font-bold text-[#07313a]">Get Started</Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section id="home" className="relative flex min-h-[700px] items-stretch overflow-hidden bg-[#061d29] pt-[76px]">
          <img src={heroImage} alt="Students overlooking a modern innovation campus at sunset" className="absolute inset-0 h-full w-full object-cover object-[62%_center]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,27,37,.98)_0%,rgba(4,27,37,.88)_34%,rgba(4,27,37,.34)_67%,rgba(4,27,37,.08)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061d29]/80 via-transparent to-[#061d29]/15" />

          <div className="relative mx-auto flex w-full max-w-[1180px] flex-col px-5 pb-7 pt-14 lg:px-8 lg:pt-12">
            <div className="max-w-[610px]">
              <p className="text-[11px] font-bold uppercase tracking-[.42em] text-emerald-200">Academia × Industry × Impact</p>
              <h1 className="mt-5 text-[42px] font-extrabold leading-[1.08] tracking-[-.035em] text-white sm:text-[54px] lg:text-[58px]">
                Connecting Talent,<br />Knowledge and Opportunities<br />for a <br className="sm:hidden" /><span className="text-emerald-300">Better Tomorrow</span>
              </h1>
              <p className="mt-5 max-w-[550px] text-[15px] leading-7 text-slate-200 sm:text-base">
                A unified platform for skill mapping, internships, placements and industry collaboration — empowering students, faculty and industry to co-create a skilled and future-ready India.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/opportunities" className="group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-emerald-300 px-7 text-sm font-extrabold text-[#07313a] shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-emerald-200">
                  Explore Opportunities <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                </Link>
                <button type="button" onClick={() => setVideoOpen(true)} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-white/55 bg-white/5 px-7 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10">
                  <CirclePlay size={19} fill="currentColor" /> Watch Video
                </button>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-7 pt-14 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid grid-cols-2 gap-x-7 gap-y-5 sm:flex sm:gap-11">
                {[
                  ['10K+', 'Students'],
                  ['500+', 'Companies'],
                  ['300+', 'Academic Institutions'],
                  ['5K+', 'Opportunities'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <strong className="text-[23px] font-extrabold text-white">{value}</strong>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-200">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:w-[440px]">
                {heroPromises.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="group rounded-xl border border-emerald-200/30 bg-[#092b36]/80 px-4 py-4 text-center shadow-2xl shadow-black/20 backdrop-blur-md transition hover:-translate-y-1 hover:border-emerald-200/60 hover:bg-[#0d3641]/90">
                    <Icon className="mx-auto text-emerald-300" size={28} strokeWidth={1.8} />
                    <h2 className="mt-2 text-sm font-extrabold text-white">{title}</h2>
                    <p className="mt-1 text-[9px] leading-4 text-slate-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="border-b border-slate-200 bg-[#f8fafc] py-7">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <h2 className="text-center text-xl font-extrabold text-[#102044]">Our Partners in Progress</h2>
            <div className="mt-5 grid grid-cols-2 divide-x divide-y divide-slate-200 overflow-hidden sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6">
              {[
                { icon: Landmark, title: 'Ministry of Skills', label: 'Government of India' },
                { icon: Sparkles, title: 'Innovation Council', label: 'National Network' },
                { icon: Landmark, title: 'Academic', label: 'Institutions' },
                { icon: BriefcaseBusiness, title: 'Industry', label: 'Partners' },
                { icon: UsersRound, title: 'Students', label: 'Community' },
                { icon: GraduationCap, title: 'Faculty', label: 'Network' },
              ].map(({ icon: Icon, title, label }) => (
                <div key={title} className="flex min-h-[80px] items-center justify-center gap-3 px-3 text-center lg:flex-col lg:gap-1">
                  <Icon size={27} className="shrink-0 text-[#285cae]" strokeWidth={1.8} />
                  <div><p className="text-xs font-extrabold text-[#102044]">{title}</p><p className="text-[10px] text-slate-500">{label}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <div className="text-center">
              <p className="text-xs font-extrabold uppercase tracking-[.18em] text-emerald-600">Built for everyone</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-.035em] text-[#102044] sm:text-[34px]">One Platform. Many Possibilities.</h2>
              <p className="mt-2 text-sm text-slate-500">Empowering every stakeholder in the journey from learning to leading.</p>
            </div>

            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {audienceCards.map(({ id, icon: Icon, title, text, className, iconClass }) => (
                <article key={id} className={`group flex min-h-[245px] flex-col rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}>
                  <span className={`grid h-12 w-12 place-items-center rounded-xl ${iconClass}`}><Icon size={26} /></span>
                  <h3 className="mt-5 text-xl font-extrabold text-[#102044]">{title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-slate-600">{text}</p>
                  <a href={`#${id}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-extrabold text-[#173c77]">Know More <ArrowRight size={16} className="transition group-hover:translate-x-1" /></a>
                </article>
              ))}
            </div>

            <div className="mt-10 space-y-6">
              <article id="students" className="scroll-mt-24 overflow-hidden rounded-2xl border border-sky-100 bg-[#f4faff] shadow-sm">
                <div className="grid items-stretch lg:grid-cols-[.9fr_1.1fr]">
                  <div className="relative min-h-[240px] overflow-hidden">
                    <img src={heroImage} alt="Students collaborating on a campus project" className="absolute inset-0 h-full w-full object-cover object-[65%_center]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-950/10 to-sky-950/55" />
                  </div>
                  <div className="flex flex-col justify-center p-7 sm:p-9">
                    <p className="text-xs font-extrabold uppercase tracking-[.18em] text-sky-600">For Students</p>
                    <h3 className="mt-2 text-2xl font-extrabold text-[#102044]">Turn your potential into a career path.</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Create a skill-first profile, discover internships matched to your strengths, follow a practical learning roadmap and apply with confidence.</p>
                    <Link to="/signup" className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-[#102044] px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#173c77]">Create your profile <ArrowRight size={15} /></Link>
                  </div>
                </div>
              </article>

              <article id="institutions" className="scroll-mt-24 overflow-hidden rounded-2xl border border-rose-100 bg-[#fff9f5] shadow-sm">
                <div className="grid items-stretch lg:grid-cols-[1.1fr_.9fr]">
                  <div className="flex flex-col justify-center p-7 sm:p-9 lg:order-first">
                    <p className="text-xs font-extrabold uppercase tracking-[.18em] text-rose-600">For Institutions</p>
                    <h3 className="mt-2 text-2xl font-extrabold text-[#102044]">Make student outcomes visible.</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Bring students, faculty and employers into one connected workspace. Track readiness, identify skill gaps and build programs around real industry demand.</p>
                    <Link to="/signup" className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-[#a9575d] px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#8f454d]">Build your institution network <ArrowRight size={15} /></Link>
                  </div>
                  <div className="relative min-h-[240px] overflow-hidden lg:order-last">
                    <img src={impactImage} alt="Graduate representing institutional impact" className="absolute inset-0 h-full w-full object-cover object-center" />
                    <div className="absolute inset-0 bg-gradient-to-l from-rose-950/10 to-rose-950/55" />
                  </div>
                </div>
              </article>

              <article id="industry" className="scroll-mt-24 overflow-hidden rounded-2xl border border-emerald-100 bg-[#f3fcf7] shadow-sm">
                <div className="grid items-stretch lg:grid-cols-[.9fr_1.1fr]">
                  <div className="relative min-h-[240px] overflow-hidden">
                    <img src={heroImage} alt="Industry and academic partners working together" className="absolute inset-0 h-full w-full object-cover object-[38%_center]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/10 to-emerald-950/60" />
                  </div>
                  <div className="flex flex-col justify-center p-7 sm:p-9">
                    <p className="text-xs font-extrabold uppercase tracking-[.18em] text-emerald-600">For Industry</p>
                    <h3 className="mt-2 text-2xl font-extrabold text-[#102044]">Meet talent before the hiring rush.</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Publish opportunities, search verified skill profiles, mentor practical projects and build long-term partnerships with academic communities.</p>
                    <Link to="/signup" className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-emerald-700">Join the partner network <ArrowRight size={15} /></Link>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="resources" className="relative overflow-hidden bg-[#061d29] py-10 text-white sm:py-12">
          <img src={impactImage} alt="Graduate celebrating on a mountain peak" className="absolute inset-0 h-full w-full object-cover object-center opacity-60" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,27,37,.98)_0%,rgba(4,27,37,.79)_50%,rgba(4,27,37,.4)_100%)]" />
          <div className="relative mx-auto grid max-w-[1180px] gap-9 px-5 lg:grid-cols-[1.1fr_2.4fr_auto] lg:items-center lg:px-8">
            <div>
              <h2 className="text-[27px] font-extrabold leading-tight">Real Collaboration.<br />Real <span className="text-emerald-300">Impact.</span></h2>
              <p className="mt-3 max-w-[310px] text-xs leading-5 text-slate-300">Together, we are building a skilled, innovative and self-reliant India through meaningful academia-industry partnerships.</p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4">
              {impactStats.map(({ icon: Icon, value, label, detail }) => (
                <div key={label} className="text-center">
                  <Icon className="mx-auto text-emerald-300" size={27} fill={label === 'Industry Projects' ? 'currentColor' : 'none'} />
                  <strong className="mt-2 block text-[23px] font-extrabold">{value}</strong>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-100">{label}</p>
                  {detail && <p className="text-[9px] text-slate-300">{detail}</p>}
                </div>
              ))}
            </div>

            <Link to="/signup" className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-6 text-xs font-extrabold text-[#07313a] shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-200">
              Be a Part of the Change <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-[#f7faf9] py-14 sm:py-16">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[.18em] text-emerald-600">Resource centre</p>
                <h2 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-[-.035em] text-[#102044] sm:text-[36px]">Practical tools for every stage of the journey.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Move from ambition to measurable progress with curated guides, hiring intelligence and programs built around real outcomes.</p>
              </div>
              <Link to="/opportunities" className="inline-flex w-fit items-center gap-2 text-sm font-extrabold text-[#173c77]">Explore opportunities <ArrowUpRight size={17} /></Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { icon: BookOpen, tag: 'Learn', title: 'Career playbooks', text: 'Structured guides for profile building, interview readiness and skill-first career planning.', action: 'Browse learning paths' },
                { icon: BarChart3, tag: 'Understand', title: 'Industry intelligence', text: 'See the skills, roles and opportunity signals shaping the next generation of work.', action: 'View market insights' },
                { icon: FileText, tag: 'Build', title: 'Partner toolkit', text: 'Templates for internships, campus programs, mentorships and outcome-led collaborations.', action: 'Open toolkit' },
              ].map(({ icon: Icon, tag, title, text, action }) => (
                <article key={title} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
                  <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Icon size={22} /></span><span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400">{tag}</span></div>
                  <h3 className="mt-6 text-lg font-extrabold text-[#102044]">{title}</h3>
                  <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500">{text}</p>
                  <a href="#contact" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#173c77]">{action} <ArrowRight size={14} className="transition group-hover:translate-x-1" /></a>
                </article>
              ))}
            </div>

            <div className="mt-7 grid overflow-hidden rounded-2xl bg-[#102044] lg:grid-cols-[1.1fr_.9fr]">
              <div className="p-7 sm:p-9">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300"><Video size={15} /> Monthly community sessions</span>
                <h3 className="mt-4 text-2xl font-extrabold text-white">Learn directly from people doing the work.</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Join conversations with hiring leaders, faculty innovators and students building meaningful projects across India.</p>
                <a href="#contact" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-5 py-3 text-xs font-extrabold text-[#07313a] transition hover:bg-emerald-200">Get session updates <ArrowRight size={15} /></a>
              </div>
              <div className="relative min-h-[220px] overflow-hidden">
                <img src={impactImage} alt="Community members learning together" className="absolute inset-0 h-full w-full object-cover object-center opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#102044] via-[#102044]/20 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-white py-14 sm:py-16">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.18em] text-emerald-600">Start a conversation</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-.035em] text-[#102044] sm:text-[38px]">Let’s build the right bridge.</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">Whether you are hiring, building a campus program or looking for your next opportunity, our team will help you find the right starting point.</p>
              <div className="mt-7 space-y-4">
                <a href="mailto:hello@skillbridge.demo" className="flex items-center gap-3 text-sm font-semibold text-[#102044] hover:text-emerald-600"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Mail size={18} /></span>hello@skillbridge.demo</a>
                <a href="tel:+911180012345" className="flex items-center gap-3 text-sm font-semibold text-[#102044] hover:text-emerald-600"><span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600"><Phone size={18} /></span>+91 11 8001 2345</a>
                <div className="flex items-center gap-3 text-sm font-semibold text-[#102044]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600"><MapPin size={18} /></span>New Delhi · Bengaluru · Remote</div>
              </div>
            </div>

            <form className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 shadow-sm sm:p-8" onSubmit={(event) => event.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-[#102044]">Your name<input required className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="Full name" /></label>
                <label className="text-xs font-bold text-[#102044]">Work email<input required type="email" className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="you@company.com" /></label>
                <label className="text-xs font-bold text-[#102044] sm:col-span-2">I am looking to<select className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"><option>Hire skilled talent</option><option>Build an institution program</option><option>Find learning opportunities</option><option>Partner on a project</option></select></label>
                <label className="text-xs font-bold text-[#102044] sm:col-span-2">Tell us about your goal<textarea required rows="4" className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm font-normal outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="A little context helps us route your enquiry faster." /></label>
              </div>
              <button type="submit" className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-[#102044] px-6 text-xs font-extrabold text-white transition hover:bg-[#173c77]">Send enquiry <ArrowRight size={15} /></button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-[#0a2430] text-white">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-5 py-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Brand />
          <nav className="flex flex-wrap gap-x-7 gap-y-2 text-[11px] font-semibold text-slate-300" aria-label="Footer navigation">
            <a href="#home" className="hover:text-white">Home</a>
            <a href="#about" className="hover:text-white">About</a>
            <a href="#contact" className="hover:text-white">Privacy</a>
            <a href="#contact" className="hover:text-white">Terms</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </nav>
          <div className="flex items-center gap-3 text-slate-300">
            {[Linkedin, Twitter, Instagram, Facebook, Youtube].map((Icon, index) => <a key={index} href="#contact" aria-label={['LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'YouTube'][index]} className="grid h-8 w-8 place-items-center rounded-md transition hover:bg-white/10 hover:text-white"><Icon size={15} /></a>)}
          </div>
          <p className="text-[9px] leading-4 text-slate-400">Made with purpose for a<br /><span className="font-semibold text-slate-300">Skilled India · Stronger India</span></p>
        </div>
      </footer>

      <Modal open={videoOpen} onClose={() => setVideoOpen(false)} title="From classrooms to careers" description="See how every part of the SkillBridge network works together." size="lg">
        <div className="overflow-hidden rounded-2xl bg-[#082632] p-6 text-white sm:p-8">
          <div className="grid gap-5 sm:grid-cols-3">
            {heroPromises.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <span className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-300">0{index + 1}</span>
                <Icon className="mt-4 text-emerald-300" size={26} />
                <h3 className="mt-3 font-extrabold">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row">
            <p className="text-sm text-slate-300"><Check className="mr-2 inline text-emerald-300" size={17} />One connected platform. Measurable outcomes.</p>
            <Link to="/signup" onClick={() => setVideoOpen(false)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-300 px-5 text-xs font-extrabold text-[#07313a]">Get Started <ArrowRight size={15} /></Link>
          </div>
        </div>
      </Modal>
    </div>
  )
}
