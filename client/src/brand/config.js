/**
 * CrackIt AI — Brand Configuration
 * Single source of truth for brand identity, metadata, and SEO.
 *
 * Product: AI Job-Readiness Platform
 * Core: Resume → JD Match → ATS Score → Skill Gap → Tailor → Cover Letter → Quiz
 */

export const BRAND_NAME       = 'CrackIt AI';
export const BRAND_TAGLINE    = 'From resume to job-ready in minutes.';
export const BRAND_SHORT_DESC =
  'Upload your resume, paste a job description, and instantly get your ATS match score, skill gap analysis, a tailored resume, cover letter, and a personalized interview quiz — all AI-powered.';

export const SITE_URL         = 'https://crackiitai.vercel.app';
export const SUPPORT_EMAIL    = 'pallavkanani27@mail.com';
export const OFFICE_LOCATION  = 'Surat, Gujarat, India';

export const OG_IMAGE         = `${SITE_URL}/og-image.png`;
export const OG_TYPE          = 'website';
export const TWITTER_CARD     = 'summary_large_image';
export const TWITTER_HANDLE   = '@crackitai';

/**
 * Per-page meta — used by <Seo page="..." /> component.
 */
export const PAGE_META = {
  home: {
    title:       `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    description: 'Upload your resume and a job description. Get your ATS match score, skill gap analysis, a tailored resume, cover letter, and AI quiz — instantly. Free to start.',
  },
  pricing: {
    title:       `Pricing — ${BRAND_NAME}`,
    description: 'Simple, transparent pricing. Start free — get your first ATS match, resume tailoring, and quiz. Upgrade for unlimited access.',
  },
  login: {
    title:       `Sign in — ${BRAND_NAME}`,
    description: 'Sign in to your CrackIt AI account and continue your job preparation.',
  },
  register: {
    title:       `Create account — ${BRAND_NAME}`,
    description: 'Join CrackIt AI free. Get your ATS match score, skill gap, tailored resume, cover letter, and interview quiz — no card required.',
  },
  dashboard: {
    title:       `Dashboard — ${BRAND_NAME}`,
    description: 'Your job-readiness dashboard. Track ATS scores, skill gaps, quiz performance, and readiness across every job you're targeting.',
  },
  jobs: {
    title:       `My Jobs — ${BRAND_NAME}`,
    description: 'Manage all your job applications. Get ATS scores, skill gaps, tailored resumes, cover letters, and quizzes for each job.',
  },
  resumeBuilder: {
    title:       `Resume Builder — ${BRAND_NAME}`,
    description: 'Build an ATS-optimized resume with the CrackIt AI resume builder. Structured format that passes applicant tracking systems.',
  },
  quiz: {
    title:       `Interview Quiz — ${BRAND_NAME}`,
    description: 'AI-generated interview quiz tailored to your target job description. 30–40 questions covering technical, HR, and role-specific topics.',
  },
  notFound: {
    title:       `Page not found — ${BRAND_NAME}`,
    description: 'The page you were looking for does not exist.',
  },
  about: {
    title:       `About us — ${BRAND_NAME}`,
    description: 'CrackIt AI helps job seekers become fully prepared for any specific job — from resume to interview — using AI.',
  },
  contact: {
    title:       `Contact — ${BRAND_NAME}`,
    description: 'Get in touch with the CrackIt AI team. Billing, technical support, or general enquiries.',
  },
};

/* ─── JSON-LD structured data ──────────────────────────────────────────── */

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
    description: 'Free plan available — no credit card required',
  },
  description: BRAND_SHORT_DESC,
  url: SITE_URL,
});
