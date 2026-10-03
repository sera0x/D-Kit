// Per-route title, description and canonical URL. index.html ships the
// homepage defaults so crawlers that never run JS still see real meta; this
// keeps the tab and the canonical honest on every other route (the site is a
// single-page app, so the static head would otherwise say "homepage" everywhere).
const SITE = 'https://dkit.name.ng';

const PAGES = {
  '/': {
    title: 'D-Kit: secrets, cron and monitors, self-hosted',
    description: 'Self-hosted secrets manager with a CLI, dashboard and API. Run commands with env vars injected, schedule HTTP calls, watch URLs, and ship logs. Free while in beta.',
  },
  '/docs': {
    title: 'D-Kit docs: CLI, API and self-hosting reference',
    description: 'Every dkit command, the HTTP API, env var rules, cron syntax and a self-hosting guide.',
  },
  '/changelog': {
    title: 'D-Kit changelog',
    description: 'What shipped, in order, with dates.',
  },
  '/status': {
    title: 'D-Kit status',
    description: 'Live uptime for the D-Kit API, website and docs, updated every 30 seconds.',
  },
  '/login': {
    title: 'Log in to D-Kit',
    description: 'Log in with your email and a one-time code.',
  },
  '/signup': {
    title: 'Create your D-Kit account',
    description: 'Free while in beta. No card required.',
  },
  '/forgot-password': {
    title: 'Reset your D-Kit password',
    description: 'We email you a link to choose a new password.',
  },
  '/reset-password': {
    title: 'Choose a new D-Kit password',
    description: 'Pick a new password for your D-Kit account.',
  },
};

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function applySeoMeta(pathname) {
  const path = (pathname || '/').split(/[?#]/)[0];
  const page = PAGES[path];
  const title = page ? page.title : 'D-Kit';
  const description = page ? page.description : PAGES['/'].description;

  document.title = title;
  upsertMeta('name', 'description', description);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = SITE + (page ? (path === '/' ? '/' : path) : '/');
}
