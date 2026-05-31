import React, { useState, useEffect } from 'react';
import { getCampaigns } from '../api';

const STATUS_BADGE = {
  draft:     { label: 'Draft',      cls: 'badge-gray' },
  scheduled: { label: 'Scheduled',  cls: 'badge-blue' },
  sending:   { label: 'Sending...', cls: 'badge-amber' },
  sent:      { label: 'Sent',       cls: 'badge-green' },
};

export default function Dashboard({ onOpen, onNew }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');

  useEffect(() => {
    getCampaigns().then(c => { setCampaigns(c); setLoading(false); });
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const totalSent    = campaigns.reduce((s, c) => s + (c.sent_count  || 0), 0);
  const totalOpens   = campaigns.reduce((s, c) => s + (c.open_count  || 0), 0);
  const totalRecip   = campaigns.reduce((s, c) => s + (c.total_recipients || 0), 0);
  const avgOpenRate  = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;

  const filtered = campaigns
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase()));

  // Chart data — last 6 campaigns
  const chartData = [...campaigns].slice(0, 6).reverse();
  const maxSent = Math.max(...chartData.map(c => c.sent_count || 0), 1);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h2>📊 Campaigns</h2>
        <button className="btn-primary" onClick={onNew}>+ New campaign</button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card purple">
          <div className="stat-label">Total Campaigns</div>
          <div className="stat-val">{campaigns.length}</div>
          <div className="stat-sub">{campaigns.filter(c => c.status === 'draft').length} drafts</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Total Recipients</div>
          <div className="stat-val">{totalRecip.toLocaleString()}</div>
          <div className="stat-sub">across all campaigns</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Emails Sent</div>
          <div className="stat-val">{totalSent.toLocaleString()}</div>
          <div className="stat-sub">{campaigns.filter(c => c.status === 'sent').length} completed</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">Avg Open Rate</div>
          <div className="stat-val">{avgOpenRate}%</div>
          <div className="stat-sub">{totalOpens.toLocaleString()} total opens</div>
        </div>
      </div>

      {/* Analytics Charts */}
      {campaigns.length > 0 && (
        <div className="analytics-grid">
          <div className="chart-card">
            <div className="chart-title">📈 Sent vs Opens — Last 6 Campaigns</div>
            <div className="bar-chart">
              {chartData.map(c => (
                <div key={c.id} className="bar-wrap">
                  <div className="bar-val">{c.sent_count || 0}</div>
                  <div className="bar sent" style={{ height: `${Math.round(((c.sent_count || 0) / maxSent) * 80)}px` }} />
                  <div className="bar opens" style={{ height: `${Math.round(((c.open_count || 0) / maxSent) * 80)}px`, marginTop: 2 }} />
                  <div className="bar-label">{c.name.slice(0, 8)}</div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item"><div className="legend-dot" style={{ background: '#6366f1' }} /> Sent</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: '#10b981' }} /> Opens</div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-title">🎯 Overall Open Rate</div>
            <div className="ring-wrap">
              <svg width="140" height="140" className="ring-svg">
                <circle cx="70" cy="70" r="54" fill="none" stroke="#334155" strokeWidth="12" />
                <circle cx="70" cy="70" r="54" fill="none" stroke="#6366f1" strokeWidth="12"
                  strokeDasharray={`${(avgOpenRate / 100) * 339} 339`}
                  strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9' }}>{avgOpenRate}%</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>open rate</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{totalOpens.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>opens</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#6366f1' }}>{totalSent.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>sent</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search campaigns..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280 }} />
        <div className="tab-bar" style={{ borderBottom: 'none', marginBottom: 0, gap: 4 }}>
          {['all', 'draft', 'scheduled', 'sending', 'sent'].map(f => (
            <button key={f} className={`tab ${filter === f ? 'on' : ''}`}
              onClick={() => setFilter(f)} style={{ padding: '6px 12px' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✉️</div>
          <p>{campaigns.length === 0 ? 'No campaigns yet. Create your first one.' : 'No campaigns match your filter.'}</p>
          {campaigns.length === 0 && <button className="btn-primary" onClick={onNew}>Create campaign</button>}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Recipients</th>
                <th>Sent</th>
                <th>Opens</th>
                <th>Open Rate</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const openRate = c.sent_count > 0 ? Math.round((c.open_count / c.sent_count) * 100) : 0;
                const badge = STATUS_BADGE[c.status] || { label: c.status, cls: 'badge-gray' };
                return (
                  <tr key={c.id} onClick={() => onOpen(c.id)} className="table-row clickable">
                    <td>
                      <div className="campaign-name">{c.name}</div>
                      <div className="campaign-subject">{c.subject}</div>
                    </td>
                    <td style={{ color: '#94a3b8' }}>{(c.total_recipients || 0).toLocaleString()}</td>
                    <td style={{ color: '#94a3b8' }}>{(c.sent_count || 0).toLocaleString()}</td>
                    <td style={{ color: '#94a3b8' }}>{(c.open_count || 0).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 48, height: 4, background: '#334155', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${openRate}%`, height: '100%', background: '#6366f1', borderRadius: 2 }} />
                        </div>
                        <span style={{ color: openRate > 20 ? '#34d399' : '#94a3b8' }}>{c.sent_count > 0 ? openRate + '%' : '—'}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                    <td className="muted">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}