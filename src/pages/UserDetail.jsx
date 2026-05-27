import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';

export default function UserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  function load() {
    api(`/users/${id}`).then(setData).catch(console.error);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function toggleBlock() {
    if (!data) return;
    await api(`/users/${data.user._id}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ blocked: !data.user.blocked }),
    });
    load();
  }

  if (!data) return <p>Loading...</p>;
  const { user, transactions } = data;

  return (
    <div>
      <p>
        <Link to="/users" className="link">
          ← Back to users
        </Link>
      </p>
      <h1 className="page-title">User Details</h1>
      <div className="panel" style={{ marginBottom: 24 }}>
        <p>
          <strong>UID:</strong> {user.uid}
        </p>
        <p>
          <strong>Name:</strong> {user.name || '-'}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Phone:</strong> {user.phone || '-'}
        </p>
        <p>
          <strong>UPI ID:</strong> {user.upiId || '-'}
        </p>
        <p>
          <strong>Balance:</strong> ₹{user.balance?.toFixed(2) ?? '0.00'}
        </p>
        <p>
          <strong>Status:</strong>{' '}
          {user.blocked ? <span className="badge blocked">Blocked</span> : <span className="badge approved">Active</span>}
        </p>
        <button
          type="button"
          className={`btn ${user.blocked ? 'btn-primary' : 'btn-danger'}`}
          style={{ marginTop: 16 }}
          onClick={toggleBlock}>
          {user.blocked ? 'Unblock User' : 'Block User'}
        </button>
      </div>

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>User Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Hash</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Value</th>
              <th>UPI</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td>{tx.transactionHash}</td>
                <td>{tx.name}</td>
                <td>{tx.phone || '-'}</td>
                <td>₹{tx.value}</td>
                <td>{tx.upiId}</td>
                <td>
                  <span className={`badge ${tx.status}`}>{tx.status}</span>
                </td>
                <td>{new Date(tx.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
