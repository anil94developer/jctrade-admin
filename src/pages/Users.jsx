import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ServerDataTable from '../components/ServerDataTable';
import { api } from '../api';

export default function Users() {
  const navigate = useNavigate();

  useEffect(() => {
    async function onClick(e) {
      const blockBtn = e.target.closest('[data-user-block]');
      if (blockBtn) {
        const id = blockBtn.getAttribute('data-id');
        const blocked = blockBtn.getAttribute('data-blocked') === 'true';
        await api(`/users/${id}/block`, {
          method: 'PATCH',
          body: JSON.stringify({ blocked: !blocked }),
        });
        blockBtn.closest('.dataTables_wrapper')?.querySelector('table')?.dispatchEvent(new Event('draw'));
        window.location.reload();
        return;
      }
      const detailBtn = e.target.closest('[data-user-detail]');
      if (detailBtn) {
        navigate(`/users/${detailBtn.getAttribute('data-id')}`);
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  const columns = useMemo(() => [
    { data: 'uid', title: 'UID' },
    { data: 'name', title: 'Name', render: (r) => r.name || '-' },
    { data: 'email', title: 'Email' },
    { data: 'phone', title: 'Phone', render: (r) => r.phone || '-' },
    { data: 'upiId', title: 'UPI ID', render: (r) => r.upiId || '-' },
    {
      data: 'balance',
      title: 'Balance',
      render: (r) => `₹${(r.balance ?? 0).toFixed(2)}`,
    },
    {
      data: 'blocked',
      title: 'Status',
      orderable: false,
      render: (r) =>
        r.blocked
          ? '<span class="badge blocked">Blocked</span>'
          : '<span class="badge approved">Active</span>',
    },
    {
      data: '_id',
      title: 'Actions',
      orderable: false,
      searchable: false,
      render: (r) => `
        <button type="button" class="btn btn-sm ${r.blocked ? 'btn-primary' : 'btn-danger'}" data-user-block data-id="${r._id}" data-blocked="${r.blocked}">
          ${r.blocked ? 'Unblock' : 'Block'}
        </button>
        <button type="button" class="btn btn-sm btn-primary" style="margin-left:6px" data-user-detail data-id="${r._id}">Details</button>
      `,
    },
    { data: 'createdAt', title: 'Joined', render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ], []);

  return (
    <div>
      <h1 className="page-title">Users List</h1>
      <div className="panel">
        <ServerDataTable endpoint="/users/datatable" columns={columns} pageLength={10} defaultOrder={[[8, 'desc']]} />
      </div>
    </div>
  );
}
