import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [price, setPrice] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api('/dashboard/stats').then(setStats).catch(console.error);
    api('/settings/usdt-price').then((d) => setPrice(String(d.price)));
  }, []);

  async function savePrice(e) {
    e.preventDefault();
    try {
      const d = await api('/settings/usdt-price', {
        method: 'PUT',
        body: JSON.stringify({ price: Number(price) }),
      });
      setPrice(String(d.price));
      setMsg('USDT price updated');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.message);
    }
  }

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <div className="cards">
        <div className="card">
          <h3>Total Users</h3>
          <p>{stats.usersCount}</p>
        </div>
        <div className="card">
          <h3>Transactions</h3>
          <p>{stats.transactionsCount}</p>
        </div>
        <div className="card">
          <h3>Pending</h3>
          <p>{stats.pendingCount}</p>
        </div>
        <div className="card">
          <h3>USDT Price (INR)</h3>
          <p>₹{stats.usdtPrice}</p>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Home page banners</h2>
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#666' }}>
          Upload sliding promo images shown on the mobile app home screen.
        </p>
        <Link to="/banners" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Manage Home Banners →
        </Link>
      </div>

      <div className="panel" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Quick: USDT Price</h2>
        <form className="price-form" onSubmit={savePrice}>
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          <button type="submit" className="btn btn-primary">
            Save Price
          </button>
        </form>
        <p style={{ margin: '12px 0 0', fontSize: 14 }}>
          <Link to="/settings" className="link">
            Wallet, maintenance, referral settings →
          </Link>
        </p>
        {msg && <p style={{ color: '#2e7d32', margin: '8px 0 0' }}>{msg}</p>}
      </div>

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Recent Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Hash</th>
              <th>Phone</th>
              <th>Value</th>
              <th>UPI</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.map((tx) => (
              <tr key={tx._id}>
                <td>{tx.userId?.email || '-'}</td>
                <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tx.transactionHash}
                </td>
                <td>{tx.phone || '-'}</td>
                <td>₹{tx.value}</td>
                <td>{tx.upiId}</td>
                <td>
                  <span className={`badge ${tx.status}`}>{tx.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 16 }}>
          <Link to="/transactions" className="link">
            View all transactions →
          </Link>
        </p>
      </div>
    </div>
  );
}
