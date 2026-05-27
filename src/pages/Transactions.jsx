import { useEffect, useMemo } from 'react';
import ServerDataTable from '../components/ServerDataTable';
import { api } from '../api';

export default function Transactions() {
  useEffect(() => {
    async function onClick(e) {
      const sendOtp = e.target.closest('[data-tx-send-otp]');
      const approve = e.target.closest('[data-tx-approve]');
      const reject = e.target.closest('[data-tx-reject]');
      const blockBtn = e.target.closest('[data-tx-block]');

      if (sendOtp) {
        try {
          const res = await api(`/transactions/${sendOtp.getAttribute('data-id')}/send-otp`, { method: 'POST' });
          alert('User notified. Their OTP will show in User OTP column after they submit.');
          window.location.reload();
        } catch (err) {
          alert(err.message || 'Failed to send OTP');
        }
      }
      if (approve) {
        try {
          await api(`/transactions/${approve.getAttribute('data-id')}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'approved' }),
          });
          window.location.reload();
        } catch (err) {
          alert(err.message || 'Approve failed');
        }
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
    { data: 'phone', title: 'Phone', render: (r) => r.phone || '-' },
    { data: 'value', title: 'Value', render: (r) => `₹${r.value}` },
    { data: 'upiId', title: 'UPI ID' },
    {
      data: 'userSubmittedOtp',
      title: 'User OTP',
      orderable: false,
      render: (r) => {
        if (r.userSubmittedOtp?.trim()) {
          return `<strong style="color:#2e7d32;font-size:15px">${r.userSubmittedOtp}</strong>`;
        }
        if (r.otpSent) return '<span style="color:#1565c0">Waiting for user OTP</span>';
        return '<span style="color:#999">—</span>';
      },
    },
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
          if (!r.otpSent) {
            html += `<button type="button" class="btn btn-sm" style="background:#1565c0;color:#fff;margin-right:4px" data-tx-send-otp data-id="${r._id}">Send OTP</button> `;
          } else if (r.userSubmittedOtp?.trim()) {
            html += `<button type="button" class="btn btn-primary btn-sm" data-tx-approve data-id="${r._id}">Approve</button> `;
          } else {
            html += `<span class="btn btn-sm" style="background:#eee;margin-right:4px;cursor:default">Awaiting OTP</span> `;
          }
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
        Send OTP → user enters OTP on Sell Orders → OTP appears here → Approve
      </p>
      <div className="panel">
        <ServerDataTable
          tableId="tx-table"
          endpoint="/transactions/datatable"
          columns={columns}
          pageLength={10}
          defaultOrder={[[8, 'desc']]}
        />
      </div>
    </div>
  );
}
