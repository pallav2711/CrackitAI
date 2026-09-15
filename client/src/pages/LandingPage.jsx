import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Briefcase, HelpCircle, Target, TrendingUp,
  ArrowRight, CheckCircle, ChevronDown, Zap, BarChart3,
  Shield, Pencil, BookOpen, Trophy,
} from 'lucide-react';
import Navbar  from '../components/landing/Navbar';
import Footer  from '../components/landing/Footer';
import Seo     from '../components/seo/Seo';
import JsonLd  from '../components/seo/JsonLd';
import {
  BRAND_NAME, BRAND_TAGLINE,
  organizationSchema, websiteSchema, softwareSchema,
} from '../brand/config';
import { PRODUCT_FAQ } from '../content/faq.js';

/* ── Feature data ─────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon:  FileText,
    num:   '01',
    title: 'ATS Resume Builder',
    desc:  'Build a clean, structured resume that passes applicant tracking systems. Section scores, keyword hints, and live preview.',
    tag:   'FEATURE',
  },
  {
    icon:  Briefcase,
    num:   '02',
    title: 'JD Matcher',
    desc:  'Paste any job description. Get an instant ATS match score, skill gap breakdown, tailored resume, and cover letter.',
    tag:   'CORE',
  },
  {
    icon:  HelpCircle,
    num:   '03',
    title: 'AI Interview Quiz',
    desc:  '30–40 MCQ questions generated from your JD. Covers technical, HR, and role-specific topics. Attempt anytime.',
    tag:   'POPULAR',
  },
  {
    icon:  TrendingUp,
    num:   '04',
    title: 'Job Readiness Score',
    desc:  'A composite score across ATS match, skill coverage, and quiz performance — so you know exactly where you stand.',
    tag:   null,
  },
  {
    icon:  Pencil,
    num:   '05',
    title: 'Resume Tailoring',
    desc:  'AI rewrites your bullet points and summary for a specific JD — without ever fabricating experience or skills.',
    tag:   null,
  },
  {
    icon:  BookOpen,
    num:   '06',
    title: 'Cover Letter Generator',
    desc:  'Professional, job-specific cover letters generated from your resume and the JD. Factual and ATS-friendly.',
    tag:   null,
  },
];

/* ── How it works steps ──────────────────────────────────────────────────── */
const STEPS = [
  { num: '01', title: 'Upload your resume',     desc: 'PDF or DOCX. AI extracts your profile in seconds.' },
  { num: '02', title: 'Paste a job description',desc: 'From any job board — LinkedIn, Naukri, anywhere.' },
  { num: '03', title: 'Get your ATS score',      desc: 'See exactly what matches, what\'s missing, and why.' },
  { num: '04', title: 'Tailor & prepare',        desc: 'Tailored resume, cover letter, and a personalised quiz — all in one place.' },
];

/* ── Social proof numbers ────────────────────────────────────────────────── */
const STATS = [
  { value: '2,500+', label: 'Job analyses done' },
  { value: '94%',    label: 'Users improved ATS score' },
  { value: '40K+',   label: 'Quiz questions served' },
  { value: '₹0',     label: 'Cost to start' },
];

/* ── Pricing tiers ───────────────────────────────────────────────────────── */
const PLANS = [
  {
    name:    'Free',
    price:   '₹0',
    period:  'forever',
    highlight: false,
    features: [
      '1 JD match per month',
      '1 resume scan',
      '1 AI quiz (30 questions)',
      'ATS score & skill gap',
      'Cover letter generation',
    ],
    cta: 'Start free',
    to:  '/register',
  },
  {
    name:    'Basic',
    price:   '₹299',
    period:  '/month',
    highlight: true,
    features: [
      '5 JD matches per month',
      'Unlimited resume scans',
      '5 AI quizzes',
      'Resume tailoring',
      'Cover letter generation',
      'Priority processing',
    ],
    cta: 'Get Basic',
    to:  '/register',
  },
  {
    name:    'Pro',
    price:   '₹699',
    period:  '/month',
    highlight: false,
    features: [
      '15 JD matches per month',
      'Unlimited everything',
      'Unlimited quizzes',
      'Advanced readiness report',
      'Prep plan generation',
      'Early access to new features',
    ],
    cta: 'Get Pro',
    to:  '/register',
  },
];

/* ── FAQ ─────────────────────────────────────────────────────────────────── */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-2 border-nb-black bg-white" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111111' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 font-bold text-sm text-left gap-4 hover:bg-nb-yellow/10 transition-colors"
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-nb-black/65 leading-relaxed border-t-2 border-nb-black pt-4">
          {a}
        </div>
      )}
    </div>
  );
};

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const faqItems = PRODUCT_FAQ?.slice(0, 8) || [
    { q: 'What is CrackIt AI?',                  a: 'CrackIt AI is an AI job-readiness platform. You upload your resume and a job description, and the platform gives you an ATS match score, skill gap analysis, a tailored resume, a cover letter, and a personalised interview quiz.' },
    { q: 'Does it fabricate resume content?',     a: 'Never. The resume tailoring improves your existing content and highlights relevant experience. If a required skill is missing, the platform tells you — it does not invent skills you don\'t have.' },
    { q: 'How is the ATS score calculated?',      a: 'The AI compares your resume against the job description across skill coverage, keyword alignment, experience relevance, education match, and project relevance. It\'s semantic — not just a keyword counter.' },
    { q: 'Can I attempt the quiz multiple times?', a: 'Yes. Each quiz is saved to your workspace. You can reattempt anytime and track your score improvement across attempts.' },
    { q: 'Is the free plan really free?',          a: 'Yes. No credit card required. The free plan includes 1 JD match, 1 resume scan, 1 quiz, and cover letter generation.' },
    { q: 'What formats does the resume upload support?', a: 'PDF and DOCX. The AI extracts your profile automatically.' },
  ];

  return (
    <>
      <Seo page="home" />
      <JsonLd schema={organizationSchema()} />
      <JsonLd schema={websiteSchema()} />
      <JsonLd schema={softwareSchema()} />

      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-[#F5F1E8] border-b-3 border-nb-black py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border-2 border-nb-black bg-nb-yellow px-4 py-2" style={{ borderRadius: '4px', boxShadow: '2px 2px 0 #111111' }}>
            <Zap className="w-3.5 h-3.5" />
            <span className="text-xs font-black uppercase tracking-widest">AI Job-Readiness Platform</span>
          </div>

          {/* Headline */}
          <h1
            className="font-black text-nb-black leading-[1.05]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.04em' }}
          >
            From resume to<br />
            <span className="bg-nb-yellow px-2 inline-block" style={{ boxShadow: '4px 4px 0 #111111' }}>job-ready</span>
            {' '}in minutes.
          </h1>

          <p className="text-lg text-nb-black/65 max-w-2xl mx-auto leading-relaxed font-medium">
            Paste your resume and a job description. Get your <strong className="text-nb-black">ATS match score</strong>,
            {' '}<strong className="text-nb-black">skill gap analysis</strong>,{' '}
            <strong className="text-nb-black">tailored resume</strong>,{' '}
            <strong className="text-nb-black">cover letter</strong>, and a{' '}
            <strong className="text-nb-black">personalised interview quiz</strong> — all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn btn-primary btn-lg"
              style={{ boxShadow: '4px 4px 0 #111111' }}
            >
              Get started free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/pricing" className="btn btn-ghost btn-lg">
              See pricing →
            </Link>
          </div>

          <p className="text-xs text-nb-black/40 font-medium">Free plan · No card required · Instant results</p>

          {/* Flow diagram */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {['Upload Resume', 'Paste JD', 'ATS Score', 'Skill Gap', 'Tailor Resume', 'Cover Letter', 'Quiz'].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wide border-2 border-nb-black bg-white px-2.5 py-1.5" style={{ borderRadius: '4px', boxShadow: '2px 2px 0 #111' }}>
                  {step}
                </span>
                {i < arr.length - 1 && <span className="text-nb-black/30 font-bold">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section className="bg-nb-black border-b-3 border-nb-black py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black text-nb-yellow" style={{ fontFamily: 'var(--font-mono)' }}>{value}</p>
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 bg-[#F5F1E8] border-b-3 border-nb-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-nb-black/45">What you get</p>
            <h2 className="font-black text-nb-black" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-0.03em' }}>
              Every tool you need.<br />Nothing you don't.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, num, title, desc, tag }) => (
              <div
                key={title}
                className="bg-white border-2 border-nb-black p-6 space-y-4 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform duration-100"
                style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 bg-nb-yellow border-2 border-nb-black flex items-center justify-center" style={{ borderRadius: '6px' }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    {tag && (
                      <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 bg-nb-black text-nb-yellow border-2 border-nb-black" style={{ borderRadius: '2px' }}>
                        {tag}
                      </span>
                    )}
                    <span className="text-[11px] font-black font-mono text-nb-black/25">{num}</span>
                  </div>
                </div>
                <div>
                  <p className="font-black text-base" style={{ fontFamily: 'var(--font-display)' }}>{title}</p>
                  <p className="text-sm text-nb-black/60 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white border-b-3 border-nb-black">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-nb-black/45">How it works</p>
            <h2 className="font-black text-nb-black" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}>
              Four steps to job-ready
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="border-2 border-nb-black p-5 bg-[#F5F1E8] space-y-3" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111111' }}>
                <span className="text-3xl font-black font-mono text-nb-yellow" style={{ WebkitTextStroke: '2px #111111' }}>{num}</span>
                <p className="font-black text-sm" style={{ fontFamily: 'var(--font-display)' }}>{title}</p>
                <p className="text-xs text-nb-black/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#F5F1E8] border-b-3 border-nb-black">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-nb-black/45">Pricing</p>
            <h2 className="font-black text-nb-black" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}>
              Simple. Transparent.
            </h2>
            <p className="text-sm text-nb-black/55 max-w-md mx-auto">Start free — no card required. Upgrade when you need more analyses.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map(({ name, price, period, highlight, features, cta, to }) => (
              <div
                key={name}
                className={`border-2 border-nb-black p-6 flex flex-col gap-5 ${highlight ? 'bg-nb-yellow' : 'bg-white'}`}
                style={{ borderRadius: '8px', boxShadow: highlight ? '6px 6px 0 #111111' : '4px 4px 0 #111111' }}
              >
                <div>
                  {highlight && (
                    <span className="text-[9px] font-black tracking-widest uppercase px-2 py-1 bg-nb-black text-nb-yellow border-2 border-nb-black mb-3 inline-block" style={{ borderRadius: '2px' }}>
                      Most Popular
                    </span>
                  )}
                  <p className="font-black text-lg" style={{ fontFamily: 'var(--font-display)' }}>{name}</p>
                  <div className="flex items-end gap-1 mt-2">
                    <span className="text-4xl font-black font-mono">{price}</span>
                    <span className="text-sm text-nb-black/50 mb-1">{period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-nb-black" />
                      <span className="text-nb-black/75">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={to}
                  className={`btn btn-block text-center font-black ${highlight ? 'bg-nb-black text-nb-yellow border-nb-black hover:bg-nb-black/80' : 'btn-primary'}`}
                  style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111111' }}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust signals ────────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-white border-b-3 border-nb-black">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Shield,    title: 'Privacy first',      desc: 'Your resume and JD data is never shared or sold. Processed and discarded.' },
              { icon: BarChart3, title: 'Honest AI',           desc: 'Resume tailoring never fabricates. Missing skills are flagged, not invented.' },
              { icon: Zap,       title: 'Instant results',     desc: 'ATS score, skill gap, and quiz ready in under 60 seconds.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 border-2 border-nb-black bg-[#F5F1E8]" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
                <div className="w-10 h-10 bg-nb-yellow border-2 border-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: '5px' }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-sm" style={{ fontFamily: 'var(--font-display)' }}>{title}</p>
                  <p className="text-xs text-nb-black/55 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#F5F1E8] border-b-3 border-nb-black">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-nb-black/45">FAQ</p>
            <h2 className="font-black text-nb-black" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.03em' }}>
              Common questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <FaqItem key={i} q={item.question || item.q} a={item.answer || item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-nb-black">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2
            className="font-black text-nb-yellow"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.04em' }}
          >
            Know exactly where you stand.<br />Before you apply.
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto">
            Paste your resume and a job description. Get your ATS score, skill gap, tailored resume, cover letter, and interview quiz — in one place, instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-primary btn-lg" style={{ boxShadow: '4px 4px 0 rgba(255,217,61,0.5)' }}>
              Get started free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/pricing" className="btn btn-ghost btn-lg text-white border-white/30 hover:bg-white/10">
              See pricing
            </Link>
          </div>
          <p className="text-xs text-white/30">Free plan · No card required · Results in 60 seconds</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
