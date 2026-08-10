import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function setMetaTag(attr, key, content) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

// Updates the tab title, meta description, Open Graph tags and canonical
// link for the current route. Google's crawler executes JS and reads the
// final DOM, so this is what lets each series/character page show up with
// its own title and snippet in search results instead of the generic one.
// `noindex: true` keeps broken/not-found URLs out of the index.
export function useDocumentMeta({ title, description, noindex = false }) {
  // Re-applies on every route change (not just when title/description
  // change) so a page like SeriesView reclaims the tab title after a child
  // modal (which sets its own, more specific title) closes and the URL
  // returns to it — otherwise the effect wouldn't re-run since its own
  // props never changed.
  const location = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} — Y QUÉ PASÓ?` : 'Y QUÉ PASÓ?';
    document.title = fullTitle;

    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
    }
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:url', window.location.href);
    setCanonical(window.location.href);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, noindex, location.key]);
}
