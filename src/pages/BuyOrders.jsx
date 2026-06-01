import { useEffect, useMemo } from 'react';
import ServerDataTable from '../components/ServerDataTable';
import { api } from '../api';

export default function BuyOrders() {
  useEffect(() => {
    async function onClick(e) {
      const approve = e.target.closest('[data-buy-approve]');
      const reject = e.target.closest('[data-buy-reject]');

      if (approve) {
        try {
          await api(`/buy/orders/${approve.getAttribute('data-id')}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'approved' }),
          });
          window.location.reload();
        } catch (err) {
          alert(err.message || 'Approve failed');
        }
      }
      if (reject) {
        await api(`/buy/orders/${reject.getAttribute('data-id')}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'rejected' }),
        });
        window.location.reload();
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const columns = useMemo(
    () => [
      {
        data: 'userId',
        title: 'User',
        orderable: false,
        render: (r) => {
          const u = r.userId;
          if (!u) return '-';
          return `<div>${u.name || u.email}</div><small>UID:${u.uid}</small>`;
        },
      },
      {
        data: 'usdtAmount',
        title: 'USDT',
        render: (r) => `${r.usdtAmount} USDT`,
      },
      {
        data: 'inrValue',
        title: 'INR paid',
        render: (r) => `₹${r.inrValue} @ ₹${r.buyRate}/USDT`,
      },
      {
        data: 'paymentMethod',
        title: 'Pay via',
        render: (r) => (r.paymentMethod === 'cdm' ? 'CDM' : 'UPI'),
      },
      { data: 'phone', title: 'Phone' },
      {
        data: 'walletAddress',
        title: 'Wallet',
        render: (r) => `<code style="font-size:11px;word-break:break-all">${r.walletAddress || '—'}</code>`,
      },
      {
        data: 'paidToUpiId',
        title: 'UPI / CDM ref',
        render: (r) =>
          r.paymentMethod === 'cdm'
            ? `<code>${r.cdmTxnReference || '—'}</code>`
            : r.paidToUpiId || '—',
      },
      {
        data: 'paymentUpiId',
        title: 'Slot',
        orderable: false,
        render: (r) => r.paymentUpiId?.label || r.paymentUpiId?.upiId || '-',
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
          if (r.status !== 'pending') return '—';
          return `<button type="button" class="btn btn-primary btn-sm" data-buy-approve data-id="${r._id}">Approve</button> <button type="button" class="btn btn-sm" data-buy-reject data-id="${r._id}">Reject</button>`;
        },
      },
    ],
    []
  );

  return (
    <div>
      <h1 className="page-title">Buy USDT requests</h1>
      <p className="field-hint" style={{ marginBottom: 16 }}>
        Users pay INR via assigned UPI, then submit USDT amount. Approve after verifying payment in your bank app.
      </p>
      <div className="panel">
        <ServerDataTable
          tableId="buy-orders-table"
          endpoint="/buy/orders/datatable"
          columns={columns}
          pageLength={10}
          defaultOrder={[[9, 'desc']]}
        />
      </div>
    </div>
  );
}
