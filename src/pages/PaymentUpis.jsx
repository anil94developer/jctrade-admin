import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      img.onerror = () => reject(new Error('Invalid image'));
      img.onload = () => {
        const max = 720;
        let { width, height } = img;
        if (width > max || height > max) {
          if (width >= height) {
            height = Math.round((height / width) * max);
            width = max;
          } else {
            width = Math.round((width / height) * max);
            height = max;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const emptyForm = { upiId: '', label: '', qrImage: '', active: true };

export default function PaymentUpis() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  function load() {
    api('/payment-upis')
      .then(setList)
      .catch((e) => setMsg(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function onQrFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await compressImageFile(file);
      setForm((f) => ({ ...f, qrImage: dataUrl }));
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.upiId.trim()) {
      setMsg('UPI ID is required');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const body = {
        upiId: form.upiId.trim(),
        label: form.label.trim(),
        qrImage: form.qrImage,
        active: form.active,
      };
      if (editingId) {
        await api(`/payment-upis/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        setMsg('UPI updated');
      } else {
        await api('/payment-upis', { method: 'POST', body: JSON.stringify(body) });
        setMsg('UPI added');
      }
      resetForm();
      load();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item) {
    setEditingId(item._id);
    setForm({
      upiId: item.upiId,
      label: item.label || '',
      qrImage: item.qrImage || '',
      active: item.active !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function toggleActive(item) {
    await api(`/payment-upis/${item._id}`, {
      method: 'PUT',
      body: JSON.stringify({ active: !item.active }),
    });
    load();
  }

  async function remove(id) {
    if (!window.confirm('Delete this UPI slot?')) return;
    await api(`/payment-upis/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <h1 className="page-title">Buy payment UPIs</h1>
      <p className="field-hint" style={{ marginBottom: 16 }}>
        Add multiple UPI IDs with QR codes. Each user opening Buy USDT gets one slot automatically (round-robin).
      </p>

      <form className="panel settings-form" onSubmit={handleSubmit}>
        <h2 className="section-heading">{editingId ? 'Edit UPI' : 'Add UPI'}</h2>
        <div className="field">
          <label>UPI ID</label>
          <input
            value={form.upiId}
            onChange={(e) => setForm((f) => ({ ...f, upiId: e.target.value }))}
            placeholder="name@upi"
            required
          />
        </div>
        <div className="field">
          <label>Label (optional)</label>
          <input
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="Account 1"
          />
        </div>
        <div className="field">
          <label>QR image</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={onQrFile} />
          {form.qrImage ? (
            <div className="qr-preview-wrap">
              <img src={form.qrImage} alt="QR" className="qr-preview" />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setForm((f) => ({ ...f, qrImage: '' }))}>
                Remove QR
              </button>
            </div>
          ) : null}
        </div>
        <div className="field row-between">
          <label>Active (shown to users)</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            <span className="slider" />
          </label>
        </div>
        {msg && <p className={msg.includes('added') || msg.includes('updated') ? 'success-msg' : 'error'}>{msg}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {editingId ? 'Update' : 'Add UPI'}
          </button>
          {editingId ? (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="panel" style={{ marginTop: 24 }}>
        <h2 className="section-heading">All UPI slots ({list.length})</h2>
        {list.length === 0 ? (
          <p className="muted">No UPI added yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>UPI ID</th>
                <th>Label</th>
                <th>QR</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item._id}>
                  <td>{item.upiId}</td>
                  <td>{item.label || '—'}</td>
                  <td>{item.qrImage?.length > 20 ? 'Yes' : 'No'}</td>
                  <td>{item.active ? 'Yes' : 'No'}</td>
                  <td>
                    <button type="button" className="btn btn-sm" onClick={() => startEdit(item)}>
                      Edit
                    </button>{' '}
                    <button type="button" className="btn btn-sm" onClick={() => toggleActive(item)}>
                      {item.active ? 'Disable' : 'Enable'}
                    </button>{' '}
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(item._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
