import { useEffect, useRef } from 'react';
import $ from 'jquery';
import DataTable from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';

window.$ = window.jQuery = $;

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('adminToken');
}

/**
 * @param {object} props
 * @param {string} props.endpoint - e.g. '/users/datatable'
 * @param {Array<{ data: string, title: string, orderable?: boolean, searchable?: boolean, render?: (row: any) => string }>} props.columns
 * @param {number} [props.pageLength]
 * @param {Array<[number, string]>} [props.defaultOrder] - e.g. [[7, 'desc']]
 */
export default function ServerDataTable({ endpoint, columns, pageLength = 10, defaultOrder = [[0, 'desc']] }) {
  const tableRef = useRef(null);
  const dtRef = useRef(null);

  useEffect(() => {
    if (!tableRef.current) return;

    const token = getToken();
    dtRef.current = new DataTable(tableRef.current, {
      processing: true,
      serverSide: true,
      pageLength,
      lengthMenu: [10, 25, 50, 100],
      order: defaultOrder,
      ajax: {
        url: `${API_BASE}${endpoint}`,
        type: 'GET',
        beforeSend(xhr) {
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        },
        dataSrc: 'data',
        error(xhr) {
          console.error('DataTable load error', xhr.status, xhr.responseText);
        },
      },
      columns: columns.map((col) => ({
        data: col.data,
        title: col.title,
        orderable: col.orderable !== false,
        searchable: col.searchable !== false,
        defaultContent: '-',
        render: col.render
          ? (data, type, row) => {
              if (type === 'display' || type === 'filter') return col.render(row);
              return data;
            }
          : undefined,
      })),
      language: {
        processing: 'Loading...',
        search: 'Search:',
        lengthMenu: 'Show _MENU_ entries',
        info: 'Showing _START_ to _END_ of _TOTAL_ entries',
        infoEmpty: 'No entries',
        paginate: { first: 'First', last: 'Last', next: 'Next', previous: 'Prev' },
      },
    });

    return () => {
      if (dtRef.current) {
        dtRef.current.destroy();
        dtRef.current = null;
      }
    };
  }, [endpoint, pageLength, defaultOrder]);

  return (
    <div className="datatable-wrap">
      <table ref={tableRef} className="display stripe" style={{ width: '100%' }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.data}>{c.title}</th>
            ))}
          </tr>
        </thead>
      </table>
    </div>
  );
}
