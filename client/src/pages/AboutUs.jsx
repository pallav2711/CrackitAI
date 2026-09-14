import { Link } from 'react-router-dom';
import { Target, Heart, Zap, Users, ArrowRight, Mic, FileText, Trophy, Brain } from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const VALUES = [
  { title: 'Students first',       desc: 'Every decision is tested against one question: does this help a final-year student land their first job faster?' },
  { title: 'Honest AI',            desc: 'We tell you when a score is AI-generated and what model produced it. No black boxes. No inflated scores.' },
  { title: 'Privacy by default',   desc: 'Leaderboard participation is opt-in. We never sell your data. Voice transcripts are deleted after 12 months.' },
  { title: 'Transparent pricing',  desc: 'One price, clearly stated in INR. No hidden fees, no usage overages, no dark patterns.' },
];

const TEAM = [
  { name: 'Pallav Kanani', role: 'Founder & Engineer', emoji: '👨‍💻', bio: 'Built CrackIt AI after watching too many talented friends fail interviews they were qualified for.' },
];

const WHAT_WE_BUILD = [
  { icon: Mic,      title: 'Voice interviews',  desc: 'Not a chatbot. Not a quiz. You speak. The AI listens. You get scored.' },
  { icon: FileText, title: 'AI resume scoring', desc: 'Structured JSON output with section-level scores, gaps, and specific suggested fixes.' },
  { icon: Trophy,   title: 'Live leaderboard',  desc: 'Weekly-reset competitive ranking. Anti-gaming enforced. College and role filters.' },
  { icon: Brain,    title: 'Smart reports',     desc: 'Per-answer breakdown: relevance, depth, structure, missing keywords, sample improved answer.' },
];

/* Reusable section header */
const SectionH2 = ({ children }) => (
  <h2
    className="font-bold uppercase tracking-tight text-nb-black"
    style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-0.03em' }}
  >
    {children}
  </h2>
);

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 px-4 bg-nb-black border-b-3 border-nb-black">
        <div className="max-w-5xl mx-auto">
          <span
            className="inline-block text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1.5 border-2 border-white/20 text-nb-yellow mb-6"
            style={{ borderRadius: '3px' }}
          >
            About CrackIt AI
          </span>
          <h1
            className="font-bold uppercase text-nb-yellow leading-none mb-6"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.75rem, 8vw, 5.5rem)',
              letterSpacing: '-0.04em',
              lineHeight: '1.0',
            }}
          >
            Built for the<br />
            <span className="text-white">student who</span><br />
            almost gave up.
          </h1>
          <p className="text-base font-medium text-white/55 max-w-2xl leading-relaxed">
            CrackIt AI was built because the gap isn't in ability — it's in preparation.
            Talented students fail interviews they're fully qualified for, simply because they've
            never heard themselves answer questions out loud.
          </p>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-b-3 border-nb-black bg-nb-yellow">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center"
                style={{ borderRadius: '6px', boxShadow: '3px 3px 0 rgba(0,0,0,0.2)' }}
              >
                <Target className="w-5 h-5 text-nb-yellow" aria-hidden="true" />
              </div>
              <SectionH2>Our mission</SectionH2>
            </div>
            <p className="text-base font-medium text-nb-black/75 leading-relaxed">
              Make voice interview practice accessible to every student in India — not just those
              who can afford a coaching centre or know someone at Google.
            </p>
            <p className="text-base font-medium text-nb-black/75 leading-relaxed">
              One free interview. No card required. Start practising in 30 seconds.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { n: '₹0',    l: 'To try it' },
              { n: '7 min', l: 'Average first session' },
              { n: '100%',  l: 'AI-powered scoring' },
              { n: '2025',  l: 'Founded' },
            ].map(({ n, l }) => (
              <div
                key={l}
                className="border-2 border-nb-black bg-white p-5 text-center"
                style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111111' }}
              >
                <div
                  className="font-black leading-none mb-1"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem' }}
                >
                  {n}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-nb-black/55">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-b-3 border-nb-black bg-[#F5F1E8]">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center"
              style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111111' }}
            >
              <Heart className="w-5 h-5 text-nb-yellow" aria-hidden="true" />
            </div>
            <SectionH2>The story</SectionH2>
          </div>
          <div
            className="border-2 border-nb-black bg-white p-8 space-y-4 text-sm font-medium text-nb-black/70 leading-relaxed"
            style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
          >
            <p>
              In 2024, Pallav Kanani watched a friend — top of their CS class, confident in a room —
              completely freeze during a phone screen. Not because they didn't know the answer.
              Because they'd never actually said it out loud before.
            </p>
            <p>
              Text-based prep tools don't fix that. Flashcards don't fix that. What fixes it is
              hearing your own voice stumble through an answer, getting scored on it, and doing it again
              until you stop stumbling.
            </p>
            <p>
              CrackIt AI started as a weekend experiment with the OpenAI Realtime API. Two months later
              it was in use at three engineering colleges in Gujarat. The product you're using now is
              the result of real feedback from real students preparing for placements.
            </p>
          </div>
        </div>
      </section>

      {/* ── What we build ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-b-3 border-nb-black bg-white">
        <div className="max-w-5xl mx-auto space-y-12">
          <SectionH2>What we build</SectionH2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHAT_WE_BUILD.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="border-2 border-nb-black bg-white p-5 flex flex-col gap-3"
                style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
              >
                <div
                  className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center"
                  style={{ borderRadius: '5px' }}
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5 text-nb-yellow" />
                </div>
                <p className="font-bold text-sm uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{title}</p>
                <p className="text-xs text-nb-black/60 font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-b-3 border-nb-black bg-[#F5F1E8]">
        <div className="max-w-5xl mx-auto space-y-12">
          <SectionH2>What we believe in</SectionH2>
          <div className="grid sm:grid-cols-2 gap-4">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className={`border-2 border-nb-black p-7 ${i === 0 ? 'bg-nb-yellow' : 'bg-white'}`}
                style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
              >
                <h3
                  className="font-bold uppercase text-base tracking-tight mb-3"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {v.title}
                </h3>
                <p className="text-sm font-medium text-nb-black/70 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-b-3 border-nb-black bg-nb-black">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-nb-yellow border-2 border-nb-yellow flex items-center justify-center"
              style={{ borderRadius: '5px' }}
            >
              <Users className="w-5 h-5 text-nb-black" aria-hidden="true" />
            </div>
            <h2
              className="font-bold uppercase text-nb-yellow"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}
            >
              The team
            </h2>
          </div>
          <div className="flex flex-wrap gap-5">
            {TEAM.map(t => (
              <div
                key={t.name}
                className="border-2 border-nb-yellow p-6 max-w-xs"
                style={{ borderRadius: '8px' }}
              >
                <div className="text-4xl mb-4">{t.emoji}</div>
                <p className="font-black uppercase text-nb-yellow" style={{ fontFamily: 'var(--font-display)' }}>{t.name}</p>
                <p className="text-[11px] font-bold text-nb-yellow/45 uppercase tracking-widest mb-3">{t.role}</p>
                <p className="text-xs text-white/55 font-medium leading-relaxed">{t.bio}</p>
              </div>
            ))}
            <div
              className="border-2 border-dashed border-nb-yellow/30 p-6 max-w-xs flex flex-col items-center justify-center text-center gap-3"
              style={{ borderRadius: '8px' }}
            >
              <span className="text-4xl">🤝</span>
              <p className="text-nb-yellow/50 text-[11px] font-bold uppercase tracking-widest">We're building</p>
              <a href="mailto:pallavkanani27@mail.com" className="btn btn-primary btn-sm">
                Join us →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-nb-yellow border-b-3 border-nb-black">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <SectionH2>Ready to practise out loud?</SectionH2>
          <p className="text-sm font-medium text-nb-black/65">
            One free interview. No credit card. Takes 30 seconds to set up.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn btn-black btn-lg">
              <Zap className="w-5 h-5" aria-hidden="true" />
              Start free
            </Link>
            <Link to="/contact" className="btn btn-secondary btn-lg">
              Contact us <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
