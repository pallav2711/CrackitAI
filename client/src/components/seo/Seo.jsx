import { useEffect } from 'react';
import {
  BRAND_NAME,
  PAGE_META,
  SITE_URL,
  OG_IMAGE,
  OG_TYPE,
  TWITTER_CARD,
  TWITTER_HANDLE,
} from '../../brand/config';

function upsertMeta(attr, key, content) {
  if (!content) return;
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Sets document title, description, robots, canonical, and social tags.
 * Use `page` keys from PAGE_META, or pass explicit overrides.
 */
export default function Seo({
  page,
  title,
  description,
  canonical,
  noindex,
  image,
}) {
  const meta = page ? PAGE_META[page] || {} : {};
  const nextTitle = title || meta.title || BRAND_NAME;
  const nextDescription = description || meta.description || '';
  const nextCanonical = canonical || meta.canonical || SITE_URL;
  const robots = (noindex ?? meta.noindex) ? 'noindex, nofollow' : 'index, follow';
  const ogImage = image || OG_IMAGE;

  useEffect(() => {
    document.title = nextTitle;
    upsertMeta('name', 'description', nextDescription);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'googlebot', robots);
    upsertLink('canonical', nextCanonical);

    upsertMeta('property', 'og:type', OG_TYPE);
    upsertMeta('property', 'og:site_name', BRAND_NAME);
    upsertMeta('property', 'og:title', nextTitle);
    upsertMeta('property', 'og:description', nextDescription);
    upsertMeta('property', 'og:url', nextCanonical);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:image:width', '1200');
    upsertMeta('property', 'og:image:height', '630');
    upsertMeta('property', 'og:locale', 'en_IN');

    upsertMeta('name', 'twitter:card', TWITTER_CARD);
    upsertMeta('name', 'twitter:title', nextTitle);
    upsertMeta('name', 'twitter:description', nextDescription);
    upsertMeta('name', 'twitter:image', ogImage);
    if (TWITTER_HANDLE) upsertMeta('name', 'twitter:site', TWITTER_HANDLE);
  }, [nextTitle, nextDescription, nextCanonical, robots, ogImage]);

  return null;
}
