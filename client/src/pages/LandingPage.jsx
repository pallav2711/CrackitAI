import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, TrendingUp, FileText, Mic, Trophy, ArrowRight,
  CheckCircle, Shield, ChevronDown, Zap, Target, BarChart3,
} from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import Seo from '../components/seo/Seo';
import JsonLd from '../components/seo/JsonLd';
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  organizationSchema,
  websiteSchema,
  softwareSchema,
} from '../brand/config';
import { PRODUCT_FAQ } from '../content/faq.js';

/* ── Data ─────────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Mic,
    label: '01',
    title: 'Voice mock interviews',
    desc: 'Speak answers out loud. AI asks questions, listens, and scores what you actually say — not what you typed.',
    tag: 'CORE',
  },
  {
    icon: FileText,
    label: '02',
    title: 'Resume scanner',
    desc: 'Section-level ATS scores, content gaps, and specific fixes. Not generic tips.',
    tag: 'POPULAR',
  },
  {
    icon: Trophy,
    label: '03',
    title: 'Weekly leaderboard',
    desc: 'Compare sessions with peers. Rankings reset weekly so practice always stays current.',
    tag: null,
  },
  {
    icon: TrendingUp,
    label: '04',
    title: 'Progress dashboard',
    desc: 'Recent interviews, scores, and plan usage in one view — no noise.',
    tag: null,
  },
  {
    icon: Brain,
    label: '05',
    title: 'Answer-level reports',
    desc: 'Relevance, structure, keyword gaps, plus a sample improved answer for each response.',
    tag: null,
  },
  {
    icon: CheckCircle,
    label: '06',
    title: 'Mock tests',
    desc: 'Aptitude, reasoning, verbal, and coding — fresh AI-generated questions each session.',
    tag: null,
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Set up your session',
    desc: 'Pick a role, difficulty level, and duration. Takes under 30 seconds.',
  },
  {
    n: '02',
    title: 'Interview out loud',
    desc: 'The AI interviewer speaks. You answer. No typing. Matches how a real interview feels.',
  },
  {
    n: '03',
    title: 'Read the report',
    desc: 'Per-answer scores, keyword gaps, and concrete fixes. Know exactly what to fix next.',
  },
];

const STATS = [
  { number: '15+',  label: 'Interview types' },
  { number: '50K+', label: 'Sessions completed' },
  { number: '4.8',  label: 'Avg. report score' },
  { number: '₹0',   label: 'To get started' },
];

/* ── FAQ Item ─────────────────────────────────────────────────────────────── */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-2 border-nb-black bg-white" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111111' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left font-bold text-sm tracking-tight hover:bg-nb-yellow/15 transition-colors"
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 ml-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="px-6 pb-5 border-t-2 border-nb-black/10 pt-4">
          <p className="text-sm text-nb-black/70 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

/* ── Waveform preview (decorative) ───────────────────────────────────────── */
const WaveformPreview = () => {
  const bars = [4,7,12,8,14,10,6,14,9,5,12,8,11,7,13,6,10,8,14,9,6,12,7,11,8,13,5,10];
  return (
    <div
      className="bg-nb-black border-3 border-nb-black p-6 space-y-5"
      style={{ borderRadius: '8px', boxShadow: '6px 6px 0 #FFD93D' }}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-nb-yellow animate-pulse" />
          <span className="text-[11px] font-black tracking-widest uppercase text-nb-yellow">Live session</span>
        </div>
        <span className="text-[11px] font-mono text-white/40">0:42 / 3:00</span>
      </div>

      {/* Question */}
      <div className="border-l-3 border-nb-yellow pl-4">
        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-bold">Question 2 of 5</p>
        <p className="text-sm font-semibold text-white leading-snug">
          Walk me through how you would design a URL shortener for high traffic.
        </p>
      </div>

      {/* Waveform */}
      <div className="flex items-end gap-[2px] h-14 bg-white/5 rounded px-3 py-2">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-nb-yellow"
            style={{
              height: `${h * 3}px`,
              opacity: i < 18 ? 0.9 : 0.35,
              borderRadius: '1px',
            }}
          />
        ))}
      </div>

      {/* Score preview */}
      <div className="grid grid-cols-3 gap-2">
        {[['Clarity', '87%'], ['Structure', '74%'], ['Keywords', '91%']].map(([k, v]) => (
          <div key={k} className="bg-white/8 border border-white/10 p-2 text-center" style={{ borderRadius: '4px' }}>
            <p className="text-[10px] text-white/45 uppercase font-bold">{k}</p>
            <p className="text-sm font-mono font-black text-nb-yellow">{v}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-white/35 font-mono">
        <span>RECORDING…</span>
        <span>Report after session</span>
      </div>
    </div>
  );
};

/* ── Page ─────────────────────────────────────────────────────────────────── */
const LandingPage = () => (
  <div className="min-h-screen bg-[#F5F1E8] flex flex-col">
    <Seo page="home" />
    <JsonLd data={[organizationSchema(), websiteSchema(), softwareSchema()]} />
    <a href="#main" className="skip-link">Skip to content</a>
    <Navbar />

    <main id="main">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="px-4 pt-16 pb-20 md:pt-24 md:pb-28 border-b-3 border-nb-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-center">

            <div className="space-y-8">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-nb-black bg-nb-yellow"
                style={{ borderRadius: '4px', boxShadow: '2px 2px 0 #111111' }}>
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="text-[11px] font-black tracking-widest uppercase">AI-powered interview prep</span>
              </div>

              {/* Headline */}
              <div>
                <h1
                  className="font-bold leading-none tracking-tight text-nb-black"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2.75rem, 7vw, 5.5rem)',
                    letterSpacing: '-0.04em',
                    lineHeight: '1.0',
                  }}
                >
                  {BRAND_TAGLINE}
                </h1>
              </div>

              <p className="text-lg text-nb-black/65 max-w-lg leading-relaxed">
                Voice interviews, resume scoring, and answer-level feedback —
                structured practice built for students and job seekers, not another chatbot.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start free
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
                <Link to="/pricing" className="btn btn-secondary btn-lg">
                  See pricing
                </Link>
              </div>

              <p className="text-sm text-nb-black/50 font-medium">
                Free plan · 1 voice interview/month · No card required
              </p>
            </div>

            {/* Product preview card */}
            <div className="w-full max-w-[420px] mx-auto lg:mx-0">
              <WaveformPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
      <section className="bg-nb-yellow border-b-3 border-nb-black" aria-label="Key numbers">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {STATS.map(({ number, label }, i) => (
              <div
                key={label}
                className={`py-6 px-5 text-center ${i < STATS.length - 1 ? 'border-r-2 border-nb-black' : ''}`}
              >
                <p
                  className="font-black text-nb-black leading-none mb-1"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
                >
                  {number}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-nb-black/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS ──────────────────────────────────────────────────── */}
      <section className="px-4 py-16 border-b-3 border-nb-black bg-white">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-0">
          {[
            {
              icon: Mic,
              title: 'Voice, not chat',
              desc: 'You answer out loud. That is the only way practice matches a real interview.',
            },
            {
              icon: Target,
              title: 'Section-level feedback',
              desc: 'Resume scores, answer gaps, and keyword hits are shown per section — not as a single number.',
            },
            {
              icon: BarChart3,
              title: 'Honest plan limits',
              desc: 'Every plan states exactly how many interviews you get. No vague "unlimited" tiers.',
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className={`p-8 flex gap-4 ${i < 2 ? 'border-r-2 border-nb-black' : ''}`}
            >
              <div
                className="w-10 h-10 bg-nb-black flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ borderRadius: '6px' }}
              >
                <Icon className="w-5 h-5 text-nb-yellow" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
                <p className="text-sm text-nb-black/60 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
      <section id="features" className="px-4 py-20 border-b-3 border-nb-black">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[11px] font-black tracking-[0.2em] uppercase text-nb-black/50 mb-3">What's inside</p>
              <h2
                className="font-bold text-nb-black"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  letterSpacing: '-0.03em',
                  lineHeight: '1.1',
                }}
              >
                Every tool you need<br />to practice seriously
              </h2>
            </div>
            <Link
              to="/register"
              className="btn btn-primary self-start md:self-end"
            >
              Create free account
            </Link>
          </div>

          {/* Feature cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, label, title, desc, tag }, idx) => (
              <article
                key={title}
                className={`border-2 border-nb-black p-6 bg-white transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 group ${
                  idx === 0 ? 'bg-nb-yellow' : 'bg-white'
                }`}
                style={{
                  borderRadius: '8px',
                  boxShadow: '4px 4px 0 #111111',
                }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`w-10 h-10 border-2 border-nb-black flex items-center justify-center ${
                      idx === 0 ? 'bg-nb-black' : 'bg-nb-cream'
                    }`}
                    style={{ borderRadius: '6px' }}
                  >
                    <Icon
                      className={`w-5 h-5 ${idx === 0 ? 'text-nb-yellow' : 'text-nb-black'}`}
                      aria-hidden="true"
                    />
                  </div>
                  {tag && (
                    <span
                      className="text-[9px] font-black tracking-widest uppercase px-2 py-1 border-2 border-nb-black bg-nb-black text-nb-yellow"
                      style={{ borderRadius: '3px' }}
                    >
                      {tag}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-black tracking-widest text-nb-black/40 mb-1.5">{label}</p>
                <h3 className="font-bold text-base mb-2.5" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
                <p className="text-sm text-nb-black/60 leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="px-4 py-20 bg-nb-black text-white border-b-3 border-nb-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-[11px] font-black tracking-[0.2em] uppercase text-nb-yellow mb-3">How it works</p>
            <h2
              className="font-bold text-white"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Three steps.<br />One complete practice round.
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-0">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className={`p-8 border-2 border-white/15 ${i > 0 ? '-ml-[2px]' : ''} hover:bg-white/5 transition-colors`}
                style={{ borderRadius: i === 0 ? '8px 0 0 8px' : i === 2 ? '0 8px 8px 0' : '0' }}
              >
                <p
                  className="font-black text-nb-yellow mb-4"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', lineHeight: '1', letterSpacing: '-0.04em' }}
                >
                  {s.n}
                </p>
                <h3
                  className="font-bold text-white mb-3"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem' }}
                >
                  {s.title}
                </h3>
                <p className="text-sm text-white/55 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              to="/interview/setup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-nb-yellow text-nb-black font-bold border-2 border-nb-yellow transition-all duration-100 hover:bg-[#FFC300]"
              style={{ borderRadius: '6px', boxShadow: '4px 4px 0 rgba(255,217,61,0.35)' }}
            >
              Try a free session
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── RESUME TOOLS ──────────────────────────────────────────────────── */}
      <section className="px-4 py-20 border-b-3 border-nb-black">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-black tracking-[0.2em] uppercase text-nb-black/50 mb-3">Resume tools</p>
              <h2
                className="font-bold text-nb-black"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  letterSpacing: '-0.03em',
                  lineHeight: '1.1',
                }}
              >
                Fix the resume before you apply
              </h2>
            </div>
            <p className="text-nb-black/60 leading-relaxed">
              Upload any resume. Get ATS scores, gap analysis, and section-level feedback.
              Everything is organized by section so you fix one thing at a time.
            </p>
            <Link to="/register" className="btn btn-black inline-flex">
              Open resume tools after signup
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Hear yourself answer',
                text: 'Most people rehearse only in their head. Voice sessions force complete answers under time pressure.',
                icon: Mic,
              },
              {
                title: 'Fix the resume first',
                text: 'Scanner feedback highlights ATS and content gaps before you send a single application.',
                icon: FileText,
              },
              {
                title: 'Transparent plan limits',
                text: 'Monthly interview caps mean you know exactly what you are paying for — no hidden overages.',
                icon: Shield,
              },
            ].map(({ title, text, icon: Icon }) => (
              <div
                key={title}
                className="flex gap-4 p-5 border-2 border-nb-black bg-white"
                style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111111' }}
              >
                <div
                  className="w-8 h-8 bg-nb-yellow border-2 border-nb-black flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderRadius: '4px' }}
                >
                  <Icon className="w-4 h-4 text-nb-black" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
                  <p className="text-sm text-nb-black/60 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────────────────── */}
      <section className="px-4 py-12 bg-white border-b-3 border-nb-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-0">
            {[
              {
                icon: Shield,
                title: 'Secure payments',
                text: 'Checkout runs on Razorpay. We never store card or UPI details.',
              },
              {
                icon: FileText,
                title: 'Plain-language policies',
                text: 'Privacy, terms, and refunds are published without legal jargon.',
              },
              {
                icon: Mic,
                title: 'Direct support',
                text: 'Billing and product questions answered via the contact page.',
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className={`flex gap-4 p-7 ${i < 2 ? 'border-r-2 border-nb-black' : ''}`}
              >
                <Icon className="w-5 h-5 text-nb-black mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-bold mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
                  <p className="text-sm text-nb-black/60">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 border-b-3 border-nb-black">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] font-black tracking-[0.2em] uppercase text-nb-black/50 mb-3">FAQ</p>
              <h2
                className="font-bold text-nb-black"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                  letterSpacing: '-0.03em',
                }}
              >
                Common questions
              </h2>
            </div>
            <Link
              to="/pricing"
              className="text-sm font-bold text-nb-black underline underline-offset-4 hover:text-nb-black/60 flex-shrink-0"
            >
              See pricing →
            </Link>
          </div>

          <div className="space-y-3">
            {PRODUCT_FAQ.slice(0, 6).map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="px-4 py-24 bg-nb-black border-b-3 border-nb-black">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="space-y-4">
              <p className="text-[11px] font-black tracking-[0.2em] uppercase text-nb-yellow">Start today</p>
              <h2
                className="font-bold text-white"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  letterSpacing: '-0.04em',
                  lineHeight: '1.0',
                }}
              >
                One free interview.<br />No card required.
              </h2>
              <p className="text-white/55 max-w-md leading-relaxed">
                Create an account, run a session, read the report.
                Upgrade only when you need more practice.
              </p>
            </div>

            <div className="flex flex-col gap-4 min-w-[200px]">
              <Link
                to="/register"
                className="btn btn-primary btn-lg"
              >
                Create free account
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link to="/pricing" className="btn btn-ghost btn-lg border-white/30 text-white hover:bg-white/10">
                View all plans
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>

    <Footer />
  </div>
);

export default LandingPage;
