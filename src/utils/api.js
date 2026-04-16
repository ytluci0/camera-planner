export const api = {
  async request(url, options = {}) {
    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    const contentType = res.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      const message = payload?.error || payload?.message || `Request failed (${res.status})`;
      throw new Error(message);
    }

    return payload;
  },
  get(url) {
    return this.request(url, { method: 'GET' });
  },
  post(url, body) {
    return this.request(url, { method: 'POST', body: JSON.stringify(body) });
  },
  put(url, body) {
    return this.request(url, { method: 'PUT', body: JSON.stringify(body) });
  },
  delete(url) {
    return this.request(url, { method: 'DELETE' });
  }
};
