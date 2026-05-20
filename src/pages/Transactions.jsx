import { useEffect, useMemo } from 'react';
import ServerDataTable from '../components/ServerDataTable';
import { api } from '../api';

export default function Transactions() {
  useEffect(() => {
    async function onClick(e) {
      const approve = e.target.closest('[data-tx-approve]');
      const reject = e.target.closest('[data-tx-reject]');
      const blockBtn = e.target.closest('[data-tx-block]');

      if (approve) {
        await api(`/transactions/${approve.getAttribute('data-id')}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'approved' }),
        });
        window.location.reload();
      }
      if (reject) {
        await api(`/transactions/${reject.getAttribute('data-id')}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'rejected' }),
        });
        window.location.reload();
      }
      if (blockBtn) {
        const id = blockBtn.getAttribute('data-id');
        const blocked = blockBtn.getAttribute('data-blocked') === 'true';
        await api(`/transactions/${id}/block`, {
          method: 'PATCH',
          body: JSON.stringify({ blocked: !blocked }),
        });
        window.location.reload();
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const columns = useMemo(() => [
    {
      data: 'userId',
      title: 'User',
      orderable: false,
      render: (r) => {
        const u = r.userId;
        if (!u) return '-';
        return `<div>${u.name || u.email}</div><small>UID:${u.uid}</small>${u.blocked ? '<small style="color:#e53935"> (blocked)</small>' : ''}`;
      },
    },
    {
      data: 'transactionHash',
      title: 'Hash',
      render: (r) => `<span style="word-break:break-all;font-size:12px">${r.transactionHash}</span>`,
    },
    { data: 'name', title: 'Name' },
    { data: 'value', title: 'Value', render: (r) => `₹${r.value}` },
    { data: 'upiId', title: 'UPI ID' },
    {
      data: 'status',
      title: 'Status',
      render: (r) => `<span class="badge ${r.status}">${r.status}</span>`,
    },
    {
      data: 'createdAt',
      title: 'Date',
      render: (r) => new Date(r.createdAt).toLocaleString(),
    },
    {
      data: '_id',
      title: 'Actions',
      orderable: false,
      searchable: false,
      render: (r) => {
        let html = '';
        if (r.status === 'pending' && !r.blocked) {
          html += `<button type="button" class="btn btn-primary btn-sm" data-tx-approve data-id="${r._id}">Approve</button> `;
          html += `<button type="button" class="btn btn-sm" style="background:#eee" data-tx-reject data-id="${r._id}">Reject</button> `;
        }
        html += `<button type="button" class="btn btn-sm ${r.blocked ? 'btn-primary' : 'btn-danger'}" data-tx-block data-id="${r._id}" data-blocked="${r.blocked}">${r.blocked ? 'Unblock' : 'Block'}</button>`;
        return html;
      },
    },
  ], []);

  return (
    <div>
      <h1 className="page-title">Transactions</h1>
      <p style={{ color: '#666', marginTop: -12, marginBottom: 20 }}>
        Server-side DataTable with search and pagination
      </p>
      <div className="panel">
        <ServerDataTable endpoint="/transactions/datatable" columns={columns} pageLength={10} defaultOrder={[[6, 'desc']]} />
      </div>
    </div>
  );
}
