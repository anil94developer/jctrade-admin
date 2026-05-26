import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Referrals() {
  const [summary, setSummary] = useState(null);
  const [team, setTeam] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/referrals/admin/summary'), api('/referrals/admin/team')])
      .then(([s, t]) => {
        setSummary(s);
        setTeam(t);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="page-title">Referrals</h1>

      {error && <p className="error">{error}</p>}

      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total users</span>
            <strong>{summary.totalUsers}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Referred signups</span>
            <strong>{summary.referredUsers}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total referral paid (₹)</span>
            <strong>{Number(summary.totalReferralPaid || 0).toFixed(2)}</strong>
          </div>
        </div>
      )}

      <div className="panel" style={{ marginTop: 24 }}>
        <h2 className="section-heading">Referred users</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>UID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Referrer</th>
                <th>Rewarded</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {team.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>
                    No referred users yet
                  </td>
                </tr>
              ) : (
                team.map((row) => (
                  <tr key={row._id}>
                    <td>{row.uid}</td>
                    <td>{row.name || '—'}</td>
                    <td>{row.email}</td>
                    <td>
                      {row.referredBy
                        ? `${row.referredBy.name || row.referredBy.uid} (${row.referredBy.uid})`
                        : '—'}
                    </td>
                    <td>{row.referralCreditGiven ? 'Yes' : 'No'}</td>
                    <td>{new Date(row.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
