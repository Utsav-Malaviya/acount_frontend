const API_BASE = process.env.REACT_APP_API_BASE || '';

export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const url = `${API_BASE}/api${path}`.replace(/\/+api/, '/api');
  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (err) {
    throw new Error('Network error. Is the backend running?');
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        message = data.error || message;
      } else {
        const text = await res.text();
        if (text) message = text;
      }
    } catch (_) {}
    throw new Error(message);
  }
  const ct = res.headers.get('content-type') || '';
  if (res.status === 204) return null;
  if (ct.includes('application/json')) return res.json();
  return null;
}


