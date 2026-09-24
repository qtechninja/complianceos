// Auto-detect API URL: use env var if set, otherwise derive from hostname on Render
const API_BASE = import.meta.env.VITE_API_URL || (() => {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.onrender.com')) {
    return `https://${window.location.hostname.replace('-web', '-api')}/api`;
  }
  return '/api';
})();

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  // Free-tier backends sleep when idle (Render spins down after 15 min, Railway
  // after 10), so the first request from a client opening the demo link hits a cold
  // boot that can take ~60s. Without this the dashboard just showed "Failed to
  // fetch". Retry reads until the backend wakes so a cold start looks like loading.
  const isRead = !config.method || config.method.toUpperCase() === 'GET';
  const deadline = Date.now() + 90000;
  let attempt = 0;

  for (;;) {
    let res;
    try {
      res = await fetch(url, config);
    } catch (networkErr) {
      // Never retry a write on a network error — the server may have received it.
      if (!isRead || Date.now() > deadline) throw networkErr;
      await new Promise((r) => setTimeout(r, Math.min(1000 * 2 ** attempt++, 8000)));
      continue;
    }

    // 502/503/504 are what a proxy returns while the service is still booting.
    if (isRead && [502, 503, 504].includes(res.status) && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, Math.min(1000 * 2 ** attempt++, 8000)));
      continue;
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
  }
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
