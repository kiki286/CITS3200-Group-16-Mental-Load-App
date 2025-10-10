// dev-on-device.js
if (typeof window !== 'undefined') {
  const isDev = process.env.NODE_ENV !== 'production';
  const isWeb = typeof document !== 'undefined';
  const params = new URLSearchParams(window.location.search);
  const wantDebug = params.has('debug');
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isDev && isWeb && isMobile && wantDebug) {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/eruda';
    s.onload = () => window.eruda && window.eruda.init();
    document.body.appendChild(s);
  }
}