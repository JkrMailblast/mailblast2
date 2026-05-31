import React, { useState } from 'react';
import { changePassword } from '../api';

export default function ChangePassword({ onClose }) {
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setErr(''); setMsg('');
    if (next.length < 6) return setErr('New password must be at least 6 characters');
    if (next.length > 16) return setErr('New password must be max 16 characters');
    if (next !== confirm) return setErr('Passwords do not match');
    setLoading(true);
    try {
      await changePassword(cur, next);
      setMsg('Password changed successfully!');
      setCur(''); setNext(''); setConfirm('');
      setTimeout(onClose, 1500);
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to change password');
    }
    setLoading(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#1e293b', borderRadius:12, padding:32, width:360, boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color:'#f1f5f9', marginBottom:24, fontSize:20 }}>🔑 Change Password</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <input type="password" placeholder="Current password" value={cur}
            onChange={e => setCur(e.target.value)}
            style={{ padding:'10px 14px', borderRadius:8, border:'1px solid #334155', background:'#0f172a', color:'#f1f5f9', fontSize:14 }} />
          <input type="password" placeholder="New password (6-16 chars)" value={next}
            onChange={e => setNext(e.target.value)}
            style={{ padding:'10px 14px', borderRadius:8, border:'1px solid #334155', background:'#0f172a', color:'#f1f5f9', fontSize:14 }} />
          <input type="password" placeholder="Confirm new password" value={confirm}
            onChange={e => setConfirm(e.target.value)}
            style={{ padding:'10px 14px', borderRadius:8, border:'1px solid #334155', background:'#0f172a', color:'#f1f5f9', fontSize:14 }} />
          {err && <div style={{ color:'#f87171', fontSize:13 }}>{err}</div>}
          {msg && <div style={{ color:'#34d399', fontSize:13 }}>{msg}</div>}
          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <button onClick={handleSubmit} disabled={loading}
              style={{ flex:1, padding:'10px', borderRadius:8, background:'#6366f1', color:'white', border:'none', cursor:'pointer', fontWeight:600 }}>
              {loading ? 'Saving...' : 'Change Password'}
            </button>
            <button onClick={onClose}
              style={{ flex:1, padding:'10px', borderRadius:8, background:'#334155', color:'#94a3b8', border:'none', cursor:'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
