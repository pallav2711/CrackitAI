import { Link } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import Seo from '../components/seo/Seo';
import JsonLd from '../components/seo/JsonLd';
import { SITE_URL, SUPPORT_EMAIL } from '../brand/config';
import { PRODUCT_FAQ } from '../content/faq.js';

export default function FAQ() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PRODUCT_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${SITE_URL}/faq` },
    ],
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Seo page="faq" />
      <JsonLd data={[schema, breadcrumb]} />
      <Navbar />
      <main className="flex-1 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="nb-badge mb-4">Help</p>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Frequently asked questions</h1>
          <p className="text-brand-muted mb-10">
            About interviews, plans, and payments. For anything else,{' '}
            <Link to="/contact" className="text-brand-primary font-semibold hover:underline">contact us</Link>
            {' '}or email {SUPPORT_EMAIL}.
          </p>
          <div className="space-y-3">
            {PRODUCT_FAQ.map((item) => (
              <details key={item.q} className="nb-card-compat p-5">
                <summary className="font-semibold cursor-pointer">{item.q}</summary>
                <p className="text-sm text-brand-muted mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
          <p className="text-sm text-brand-muted mt-10">
            See <Link to="/pricing" className="font-semibold text-brand-primary hover:underline">pricing</Link>
            {' '}and the <Link to="/refund-policy" className="font-semibold text-brand-primary hover:underline">refund policy</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
