/**
 * CrackIt AI — Brand Configuration
 * Single source of truth for brand identity, metadata, and SEO.
 */

export const BRAND_NAME      = 'CrackIt AI';
export const BRAND_TAGLINE   = 'Practice interviews. Strengthen your resume. Get hired.';
export const BRAND_SHORT_DESC =
  'AI-powered voice mock interviews, ATS resume scoring, and structured feedback for students and job seekers.';

export const SITE_URL        = 'https://crackiitai.vercel.app';
export const SUPPORT_EMAIL   = 'pallavkanani27@mail.com';
export const OFFICE_LOCATION = 'Surat, Gujarat, India';

export const OG_IMAGE        = `${SITE_URL}/og-image.png`;
export const OG_TYPE         = 'website';
export const TWITTER_CARD    = 'summary_large_image';
export const TWITTER_HANDLE  = '@crackitai';

/**
 * Per-page meta data.
 * Used by <Seo page="..." /> component.
 */
export const PAGE_META = {
  home: {
    title:       `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    description: 'CrackIt AI helps you prepare for jobs with voice mock interviews, ATS resume scoring, and structured feedback. Start free — no card required.',
  },
  pricing: {
    title:       `Pricing — ${BRAND_NAME}`,
    description: 'Simple, honest pricing for AI interview prep. Start free. Upgrade only when you need more sessions.',
  },
  login: {
    title:       `Sign in — ${BRAND_NAME}`,
    description: 'Sign in to your CrackIt AI account to continue your interview prep.',
  },
  register: {
    title:       `Create account — ${BRAND_NAME}`,
    description: 'Join CrackIt AI free. One voice interview per month, unlimited resume scans. No card required.',
  },
  dashboard: {
    title:       `Dashboard — ${BRAND_NAME}`,
    description: 'Your interview prep dashboard. Track scores, usage, and activity.',
  },
  notFound: {
    title:       `Page not found — ${BRAND_NAME}`,
    description: 'The page you were looking for does not exist.',
  },
  about: {
    title:       `About us — ${BRAND_NAME}`,
    description: 'CrackIt AI was built for students who want structured interview practice, not another chatbot.',
  },
  contact: {
    title:       `Contact — ${BRAND_NAME}`,
    description: 'Get in touch with the CrackIt AI team. Billing, technical support, or general enquiries.',
  },
};

/* ─── JSON-LD structured data helpers ──────────────────────────────────── */

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BRAND_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  contactPoint: {
    '@type': 'ContactPoint',
    email: SUPPORT_EMAIL,
    contactType: 'customer support',
  },
  sameAs: [],
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: BRAND_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const softwareSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: BRAND_NAME,
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    description: 'Free plan available',
  },
  description: BRAND_SHORT_DESC,
  url: SITE_URL,
});
