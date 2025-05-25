export function register() { if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/service-worker.js'); }}const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  // [::1] é o localhost IPv6.
  window.location.hostname === '[::1]' ||
  // 127.0.0.0/8 é considerado localhost para IPv4.
  window.location.hostname.match(
    /^127(?:\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Verifica SW local
        checkValidServiceWorker(swUrl, config);
      } else {
        // Registra SW em produção
        registerValidSW(swUrl, config);
      }
    });
  }
}
