import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // user friendly name, e.g., directory/related name
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [mode]);

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    const uname = username.trim().toLowerCase();
    try {
      const data = await api('/auth/signup', { method: 'POST', body: { username: uname, password, name: displayName.trim() } });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('current_user', data.user.username);
      localStorage.setItem('current_user_name', data.user.name);
      onAuthenticated(data.user.username);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    const uname = username.trim().toLowerCase();
    try {
      const data = await api('/auth/login', { method: 'POST', body: { username: uname, password } });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('current_user', data.user.username);
      localStorage.setItem('current_user_name', data.user.name);
      onAuthenticated(data.user.username);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '10vh auto', padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
      <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
        <button onClick={() => setMode('login')} style={{ flex: 1, padding: 10, background: mode === 'login' ? '#0d6efd' : '#fff', color: mode === 'login' ? '#fff' : '#111', border: 'none', cursor: 'pointer' }}>Login</button>
        <button onClick={() => setMode('signup')} style={{ flex: 1, padding: 10, background: mode === 'signup' ? '#0d6efd' : '#fff', color: mode === 'signup' ? '#fff' : '#111', border: 'none', cursor: 'pointer' }}>Sign Up</button>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12 }} autoComplete="on">
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Username</label>
            <input name="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. john" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Password</label>
            <input type="password" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }} />
          </div>
          {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}
          <button type="submit" style={{ padding: '10px 16px', border: '1px solid #0d6efd', background: '#0d6efd', color: '#fff', borderRadius: 6, cursor: 'pointer' }}>Login</button>
        </form>
      ) : (
        <form onSubmit={handleSignup} style={{ display: 'grid', gap: 12 }} autoComplete="on">
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Username</label>
            <input name="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. john" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Password</label>
            <input type="password" name="new-password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Your Name / Directory Name</label>
            <input name="name" autoComplete="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. My Ledger" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }} />
          </div>
          {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}
          <button type="submit" style={{ padding: '10px 16px', border: '1px solid #16a34a', background: '#16a34a', color: '#fff', borderRadius: 6, cursor: 'pointer' }}>Create Account</button>
        </form>
      )}
    </div>
  );
}
