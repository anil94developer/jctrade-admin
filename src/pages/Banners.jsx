import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

const emptyForm = {
  title: '',
  subtitle: '',
  image: '',
  link: '',
  bgColor: '#FF6B35',
  enabled: true,
  sortOrder: '0',
};

export default function Banners() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  function load() {
    api('/banners')
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

  function compressImageFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = () => {
        img.onerror = () => reject(new Error('Invalid image'));
        img.onload = () => {
          const max = 900;
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

  async function onImageFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMsg('Upload PNG or JPG');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const dataUrl = await compressImageFile(file);
      setForm((f) => ({ ...f, image: dataUrl }));
      setMsg('Image ready — click Add banner to publish on home');
    } catch (err) {
      setMsg(err.message || 'Image upload failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const body = {
        title: form.title,
        subtitle: form.subtitle,
        image: form.image,
        link: form.link,
        bgColor: form.bgColor,
        enabled: form.enabled,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editingId) {
        await api(`/banners/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        setMsg('Banner updated');
      } else {
        if (!form.image) {
          setMsg('Banner image is required');
          setLoading(false);
          return;
        }
        await api('/banners', { method: 'POST', body: JSON.stringify(body) });
        setMsg('Banner added');
      }
      resetForm();
      load();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(b) {
    setEditingId(b._id);
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      image: b.image || '',
      link: b.link || '',
      bgColor: b.bgColor || '#FF6B35',
      enabled: b.enabled !== false,
      sortOrder: String(b.sortOrder ?? 0),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(id) {
    if (!confirm('Delete this banner?')) return;
    try {
      await api(`/banners/${id}`, { method: 'DELETE' });
      load();
      setMsg('Banner deleted');
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function toggleEnabled(b) {
    try {
      await api(`/banners/${b._id}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: !b.enabled }),
      });
      load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div>
      <h1 className="page-title">Home Banners</h1>
      <p className="field-hint" style={{ marginBottom: 8 }}>
        Manage sliding banners on the <strong>app Home page</strong>. Lower sort order = shown first.
        Auto-slides every few seconds.
      </p>
      <p className="field-hint" style={{ marginBottom: 16 }}>
        API: <code>{import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}</code> — must match the user app
        server. Redeploy server if banners do not appear in the app.
      </p>

      <form className="panel settings-form" onSubmit={handleSubmit}>
        <h2 className="section-heading">{editingId ? 'Edit banner' : 'Add banner'}</h2>

        <div className="field">
          <label>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="We have a gift for you!" />
        </div>
        <div className="field">
          <label>Subtitle</label>
          <input
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Invite friends and earn"
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Background color</label>
            <input type="color" value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })} />
          </div>
          <div className="field">
            <label>Sort order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label>Link (optional)</label>
          <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
        </div>
        <div className="field row-between">
          <label>Enabled</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            />
            <span className="slider" />
          </label>
        </div>
        <div className="field">
          <label>Banner image</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={onImageFile} />
          {form.image ? (
            <div className="qr-preview-wrap">
              <img src={form.image} alt="Banner preview" className="qr-preview" style={{ maxWidth: '100%' }} />
            </div>
          ) : null}
        </div>

        {msg && <p className={msg.includes('added') || msg.includes('updated') ? 'success-msg' : 'error'}>{msg}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : editingId ? 'Update banner' : 'Add banner'}
          </button>
          {editingId ? (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="panel" style={{ marginTop: 24 }}>
        <h2 className="section-heading">Active banners ({list.length})</h2>
        {list.length === 0 ? (
          <p className="field-hint">No banners yet. Add one above.</p>
        ) : (
          <div className="banner-admin-list">
            {list.map((b) => (
              <div key={b._id} className="banner-admin-card">
                {b.image ? (
                  <img src={b.image} alt="" className="banner-admin-thumb" />
                ) : (
                  <div className="banner-admin-thumb banner-admin-thumb-empty">No image</div>
                )}
                <div className="banner-admin-meta">
                  <strong>{b.title || 'Untitled'}</strong>
                  <span>{b.subtitle}</span>
                  <span className="field-hint">
                    Order {b.sortOrder} · {b.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="banner-admin-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => toggleEnabled(b)}>
                    {b.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(b)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => remove(b._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
