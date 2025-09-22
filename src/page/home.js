import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

function formatDateTimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

export default function Home({ currentUser, onLogout }) {
  const [type, setType] = useState('credit'); // credit = money in, debit = money out
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [timestamp, setTimestamp] = useState(formatDateTimeLocal(new Date()));
  const [entries, setEntries] = useState([]);
  const [displayName, setDisplayName] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  // Load user display name
  useEffect(() => {
    const name = localStorage.getItem('current_user_name');
    if (name) setDisplayName(name);
  }, [currentUser]);

  // Load from backend when user changes
  useEffect(() => {
    async function fetchEntries() {
      try {
        const data = await api('/entries', { token });
        setEntries(data);
      } catch (_) {
        setEntries([]);
      }
    }
    if (token) fetchEntries();
  }, [token, currentUser]);

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, e) => {
        const value = Number(e.amount) || 0;
        if (e.type === 'credit') acc.credit += value; else acc.debit += value;
        acc.balance = acc.credit - acc.debit;
        return acc;
      },
      { credit: 0, debit: 0, balance: 0 }
    );
  }, [entries]);

  function resetForm() {
    setType('credit');
    setAmount('');
    setNote('');
    setTimestamp(formatDateTimeLocal(new Date()));
  }

  function handleAdd(e) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;

    const payload = { type, amount: numericAmount, note: note.trim(), timestamp };
    api('/entries', { method: 'POST', body: payload, token })
      .then((created) => setEntries([created, ...entries]))
      .catch(() => {});
    resetForm();
  }

  function handleDelete(id) {
    api(`/entries/${id}`, { method: 'DELETE', token })
      .then(() => setEntries(entries.filter(e => (e._id || e.id) !== id)))
      .catch(() => {});
  }

  return (
    <div className="container">
      <div className="header">
        <div className="headerTitleWrap">
          <div className="headerTitle">Personal Account</div>
          <div className="headerSub">Dashboard</div>
        </div>
        <div className="headerActions">
          <span className="headerGreeting">Hi, {displayName || currentUser}</span>
          <button className="logoutBtn" onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' }}>
          <div style={{ fontSize: 12, color: '#555' }}>Total Credit</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#14532d' }}>+{totals.credit.toFixed(2)}</div>
        </div>
        <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' }}>
          <div style={{ fontSize: 12, color: '#555' }}>Total Debit</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#7f1d1d' }}>-{totals.debit.toFixed(2)}</div>
        </div>
        <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#eef2ff' }}>
          <div style={{ fontSize: 12, color: '#555' }}>Balance</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{totals.balance.toFixed(2)}</div>
        </div>
      </div>
      {/* Main content: two columns */}
      <div className="mainGrid">
        {/* Left: form card */}
        <div className="card">
          <div className="cardHeader">Add Entry</div>
          <div className="cardBody">
            <div className="typeButtons">
              <button type="button" className={`typeButton typeCredit ${type === 'credit' ? 'typeActive' : ''}`} onClick={() => setType('credit')}>
                <span>Credit</span>
                <span>+</span>
              </button>
              <button type="button" className={`typeButton typeDebit ${type === 'debit' ? 'typeActive' : ''}`} onClick={() => setType('debit')}>
                <span>Debit</span>
                <span>-</span>
              </button>
            </div>
            <form onSubmit={handleAdd} className="formGrid">
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="0.00"
                  style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Date</label>
                <input
                  type="date"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Description (optional)"
                  style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }}
                />
              </div>
              <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                <button type="submit" style={{ padding: '10px 16px', border: '1px solid #0d6efd', background: '#0d6efd', color: '#fff', borderRadius: 8, cursor: 'pointer' }}>Add Entry</button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: entries card */}
        <div className="card">
          <div className="cardHeader">Entries</div>
          <div className="cardBody">
            {entries.length === 0 ? (
              <div style={{ color: '#555', padding: 8 }}>No entries yet.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {entries.map((e) => (
                  <li key={e._id || e.id} className="entryRow">
                    <span style={{ fontWeight: 700, color: e.type === 'credit' ? '#14532d' : '#7f1d1d' }}>
                      {e.type === 'credit' ? '+' : '-'}{Number(e.amount).toFixed(2)}
                    </span>
                    <span className="entryNote" style={{ color: '#111' }}>{e.note || '\u2014'}</span>
                    <span style={{ fontSize: 12, color: '#555' }}>{new Date(e.timestamp).toLocaleDateString()}</span>
                    <button onClick={() => handleDelete(e._id || e.id)} style={{ padding: '6px 10px', border: '1px solid #ef4444', background: '#ef4444', color: '#fff', borderRadius: 8, cursor: 'pointer' }}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
