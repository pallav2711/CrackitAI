import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Loader2, CreditCard, HelpCircle, Bug } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const TOPICS = [
  { value: '',            label: 'Select a topic' },
  { value: 'billing',     label: '💳 Billing & Payments' },
  { value: 'refund',      label: '💸 Refund Request' },
  { value: 'support',     label: '🛠 Technical Support' },
  { value: 'voice',       label: '🎙 Voice Interview Issue' },
  { value: 'feature',     label: '✨ Feature Request' },
  { value: 'partnership', label: '🤝 College / Partnership' },
  { value: 'security',    label: '🔐 Security / Privacy' },
  { value: 'other',       label: '💬 Other' },
];

const INFO_CARDS = [
  {
    icon: Mail,
    title: 'Email support',
    detail: 'pallavkanani27@mail.com',
    href: 'mailto:pallavkanani27@mail.com',
    sub: 'Reply within 24 hours on business days',
  },
  {
    icon: CreditCard,
    title: 'Billing & refunds',
    detail: 'pallavkanani27@mail.com',
    href: 'mailto:pallavkanani27@mail.com',
    sub: 'Payment issues, cancellations, refund requests',
  },
  {
    icon: Phone,
    title: 'Phone',
    detail: '+91 6354678706',
    href: 'tel:+916354678706',
    sub: 'Mon–Fri · 10am–6pm IST',
  },
  {
    icon: MapPin,
    title: 'Office',
    detail: 'Surat, Gujarat',
    href: '#',
    sub: 'India — 395001',
  },
];

export default function Contact() {
  const [form, setForm]       = useState({ name: '', email: '', topic: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      setSent(true);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: '', email: '', topic: '', message: '' });
    } catch {
      toast.error('Failed to send. Email us directly at pallavkanani27@mail.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <Navbar />

      {/* ── Hero strip ─────────────────────────────────────────────────── */}
      <section className="pt-24 pb-12 px-4 bg-nb-yellow border-b-3 border-nb-black">
        <div className="max-w-5xl mx-auto">
          <span
            className="inline-block text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1.5 border-2 border-nb-black bg-nb-black text-nb-yellow mb-5"
            style={{ borderRadius: '3px' }}
          >
            Contact us
          </span>
          <h1
            className="font-bold uppercase text-nb-black leading-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              letterSpacing: '-0.04em',
              lineHeight: '1.0',
            }}
          >
            We're here<br />to help.
          </h1>
          <p className="text-base font-medium text-nb-black/65 mt-4 max-w-xl">
            Billing question, technical issue, or just want to say hello — we read and respond to every message.
          </p>
        </div>
      </section>

      <main className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10">

          {/* ── Left: info cards + quick links ───────────────────────── */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {INFO_CARDS.map(({ icon: Icon, title, detail, href, sub }) => (
                <a
                  key={title}
                  href={href}
                  className="border-2 border-nb-black bg-white p-5 flex flex-col gap-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
                  style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
                >
                  <div
                    className="w-9 h-9 bg-nb-black flex items-center justify-center border-2 border-nb-black"
                    style={{ borderRadius: '5px' }}
                    aria-hidden="true"
                  >
                    <Icon className="w-4 h-4 text-nb-yellow" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/45">{title}</p>
                    <p className="font-bold text-sm mt-0.5">{detail}</p>
                    <p className="text-xs font-medium text-nb-black/50 mt-0.5 leading-relaxed">{sub}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Quick links */}
            <div
              className="border-2 border-nb-black bg-nb-black p-6 space-y-3"
              style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #FFD93D' }}
            >
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-yellow/55 mb-4">Quick links</p>
              {[
                { icon: HelpCircle,    label: 'Refund Policy',    to: '/refund-policy' },
                { icon: CreditCard,    label: 'Billing page',     to: '/billing' },
                { icon: Bug,           label: 'Privacy Policy',   to: '/privacy-policy' },
                { icon: MessageSquare, label: 'Terms of Service', to: '/terms-of-service' },
              ].map(({ icon: Icon, label, to }) => (
                <a
                  key={label}
                  href={to}
                  className="flex items-center gap-3 text-sm font-bold text-white/60 hover:text-nb-yellow transition-colors py-1"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label} →
                </a>
              ))}
            </div>

            {/* Response SLA */}
            <div
              className="border-2 border-nb-black bg-nb-yellow p-5"
              style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111111' }}
            >
              <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-3">Response times</p>
              <ul className="space-y-1.5 text-xs font-medium text-nb-black/65">
                <li>• <strong>Billing / refund issues</strong> — within 1 business day</li>
                <li>• <strong>Technical support</strong> — within 24 hours</li>
                <li>• <strong>General enquiries</strong> — within 48 hours</li>
                <li>• <strong>Security reports</strong> — within 4 hours</li>
              </ul>
            </div>
          </div>

          {/* ── Right: form ───────────────────────────────────────────── */}
          <div>
            {/* Header strip */}
            <div
              className="bg-nb-black border-3 border-nb-black border-b-0 px-6 py-4"
              style={{ borderRadius: '8px 8px 0 0', boxShadow: '4px 0 0 #111111, -4px 0 0 #111111' }}
            >
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-yellow/55">Send a message</p>
              <h2
                className="font-bold uppercase text-white mt-0.5"
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', letterSpacing: '-0.02em' }}
              >
                We read every one
              </h2>
            </div>

            {sent ? (
              <div
                className="border-3 border-nb-black bg-nb-yellow p-10 text-center space-y-4"
                style={{ boxShadow: '4px 4px 0 #111111' }}
              >
                <div className="text-5xl" aria-hidden="true">✅</div>
                <h3
                  className="font-bold uppercase"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}
                >
                  Message sent!
                </h3>
                <p className="text-sm font-medium text-nb-black/65">
                  We'll reply to your email within 24 hours on business days.
                </p>
                <button onClick={() => setSent(false)} className="btn btn-black btn-sm">
                  Send another →
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="border-3 border-nb-black bg-white p-8 space-y-5"
                style={{ boxShadow: '4px 4px 0 #111111' }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="nb-label" htmlFor="c-name">Name *</label>
                    <input
                      id="c-name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={set}
                      required
                      className="nb-input"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="nb-label" htmlFor="c-email">Email *</label>
                    <input
                      id="c-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={set}
                      required
                      className="nb-input"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="nb-label" htmlFor="c-topic">Topic *</label>
                  <select
                    id="c-topic"
                    name="topic"
                    value={form.topic}
                    onChange={set}
                    required
                    className="nb-select"
                  >
                    {TOPICS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="nb-label" htmlFor="c-msg">Message *</label>
                  <textarea
                    id="c-msg"
                    name="message"
                    value={form.message}
                    onChange={set}
                    required
                    rows={6}
                    className="nb-textarea"
                    placeholder="Describe your issue or question in detail…"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-black w-full justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" aria-hidden="true" />
                      Send message
                    </>
                  )}
                </button>

                <p className="text-xs font-medium text-nb-black/45 text-center">
                  * We never share your info. See our{' '}
                  <a href="/privacy-policy" className="underline font-bold hover:text-nb-black">
                    Privacy Policy
                  </a>.
                </p>
              </form>
            )}

            {/* Bottom bar */}
            <div
              className="border-3 border-nb-black border-t-0 bg-nb-black px-6 py-3 flex items-center justify-center"
              style={{ borderRadius: '0 0 8px 8px', boxShadow: '4px 4px 0 #111111' }}
            >
              <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
                We respond to every message
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
