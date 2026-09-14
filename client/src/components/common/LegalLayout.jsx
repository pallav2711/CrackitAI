import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';
import Seo from '../seo/Seo';

const LegalLayout = ({ title, subtitle, badge, lastUpdated, seoPage, children }) => (
  <div className="min-h-screen bg-brand-bg flex flex-col">
    {seoPage && <Seo page={seoPage} />}
    <Navbar />
    <main className="flex-1 pt-10 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-muted hover:text-brand-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to home
        </Link>

        <header className="mb-8">
          {badge && <span className="nb-badge-black mb-3 inline-block">{badge}</span>}
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-brand-muted mt-3 max-w-xl">{subtitle}</p>}
          {lastUpdated && (
            <p className="text-xs text-brand-muted mt-4">Last updated: {lastUpdated}</p>
          )}
        </header>

        <div className="nb-card-compat p-8 md:p-10 space-y-10">{children}</div>
      </div>
    </main>
    <Footer />
  </div>
);

export const DocSection = ({ number, title, children }) => (
  <section>
    <div className="flex items-start gap-4 mb-4">
      {number && (
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-primary text-white text-xs font-semibold flex items-center justify-center">
          {number}
        </span>
      )}
      <h2 className="text-xl font-semibold pt-1">{title}</h2>
    </div>
    <div className="space-y-3 text-sm text-brand-muted leading-relaxed">
      {children}
    </div>
  </section>
);

export const DocList = ({ items }) => (
  <ul className="space-y-2 mt-2">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3">
        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-primary mt-2" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export const DocHighlight = ({ children, variant = 'yellow' }) => {
  const cls = {
    yellow: 'bg-brand-bg border-brand-border text-brand-text',
    black: 'bg-brand-primary text-white border-brand-primary',
    red: 'bg-brand-error/10 text-brand-error border-brand-error/20',
  }[variant];
  return (
    <div className={`border rounded-xl ${cls} p-4 text-sm font-medium mt-3`}>
      {children}
    </div>
  );
};

export const DocContact = ({ label, href, value }) => (
  <div className="flex items-center gap-3 mt-2">
    <span className="text-xs font-semibold tracking-wide text-brand-muted w-20">{label}</span>
    <a href={href} className="text-sm font-semibold text-brand-primary underline underline-offset-2">{value}</a>
  </div>
);

export default LegalLayout;
