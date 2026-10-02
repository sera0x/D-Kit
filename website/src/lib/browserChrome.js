// Keeps the browser chrome (iOS status bar, overscroll area) in step with the theme.
// iOS 26 Safari ignores <meta name="theme-color">. It tints from a fixed element at the
// very top of the viewport, else from <body>'s background, and re-reads only at certain
// moments. So we drive all sources: inline body/html bg, a re-created fixed strip, the meta.

export const MARKETING_THEME_COLOR = '#050606';
export const SHELL_LIGHT_THEME_COLOR = '#ffffff';
const STRIP_ID = 'dkit-chrome-tint';

function setThemeColor(color) {
  document.head.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove());
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'theme-color');
  meta.setAttribute('content', color);
  document.head.appendChild(meta);
}

function replaceStrip(color) {
  const old = document.getElementById(STRIP_ID);
  if (old) old.remove();
  const strip = document.createElement('div');
  strip.id = STRIP_ID;
  strip.setAttribute('aria-hidden', 'true');
  strip.style.backgroundColor = color;
  document.body.appendChild(strip);
}

let resampleTimer = null;

export function applyChromeTheme(theme) {
  const color = theme === 'light' ? SHELL_LIGHT_THEME_COLOR : MARKETING_THEME_COLOR;
  const root = document.documentElement;
  if (theme === 'light') root.setAttribute('data-chrome', 'light');
  else root.removeAttribute('data-chrome');
  root.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
  setThemeColor(color);
  replaceStrip(color);
  clearTimeout(resampleTimer);
  resampleTimer = setTimeout(() => replaceStrip(color), 150);
}

export function nudgeBrowserChrome({ keepPosition = false } = {}) {
  const t = setTimeout(() => {
    const y = keepPosition ? window.scrollY : 0;
    window.scrollTo(0, y + 1);
    requestAnimationFrame(() => window.scrollTo(0, y));
  }, 60);
  return () => clearTimeout(t);
}
