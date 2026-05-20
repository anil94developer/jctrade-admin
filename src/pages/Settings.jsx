import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = {
  walletAddress: '',
  usdtPrice: '',
  maintenanceMode: false,
  referralReward: '',
  supportPhone: '',
  supportTelegram: '',
  supportWhatsapp: '',
  supportPhoneVisible: true,
  supportTelegramVisible: true,
  supportWhatsappVisible: true,
};

export default function Settings() {
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/settings')
      .then((d) =>
        setForm({
          walletAddress: d.walletAddress || '',
          usdtPrice: String(d.usdtPrice ?? ''),
          maintenanceMode: Boolean(d.maintenanceMode),
          referralReward: String(d.referralReward ?? ''),
          supportPhone: d.supportPhone || '',
          supportTelegram: d.supportTelegram || '',
          supportWhatsapp: d.supportWhatsapp || '',
          supportPhoneVisible: d.supportPhoneVisible !== false,
          supportTelegramVisible: d.supportTelegramVisible !== false,
          supportWhatsappVisible: d.supportWhatsappVisible !== false,
        })
      )
      .catch(console.error);
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await api('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          walletAddress: form.walletAddress,
          usdtPrice: Number(form.usdtPrice),
          maintenanceMode: form.maintenanceMode,
          referralReward: Number(form.referralReward),
          supportPhone: form.supportPhone,
          supportTelegram: form.supportTelegram,
          supportWhatsapp: form.supportWhatsapp,
          supportPhoneVisible: form.supportPhoneVisible,
          supportTelegramVisible: form.supportTelegramVisible,
          supportWhatsappVisible: form.supportWhatsappVisible,
        }),
      });
      setMsg('Settings saved successfully');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Settings</h1>

      <form className="panel settings-form" onSubmit={handleSave}>
        <h2 className="section-heading">USDT & Wallet</h2>

        <div className="field">
          <label>Wallet Address (USDT receive)</label>
          <p className="field-hint">Users send USDT to this address before submitting the form</p>
          <input
            type="text"
            value={form.walletAddress}
            onChange={(e) => update('walletAddress', e.target.value)}
            placeholder="TRC20 / ERC20 wallet address"
          />
        </div>

        <div className="field">
          <label>Current USDT Price (INR)</label>
          <input
            type="number"
            step="0.01"
            value={form.usdtPrice}
            onChange={(e) => update('usdtPrice', e.target.value)}
            required
          />
        </div>

        <div className="field row-between">
          <div>
            <label>System Maintenance</label>
            <p className="field-hint">When ON, users cannot submit sell requests</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={(e) => update('maintenanceMode', e.target.checked)}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="field">
          <label>Referral Reward Value (₹)</label>
          <input
            type="number"
            step="0.01"
            value={form.referralReward}
            onChange={(e) => update('referralReward', e.target.value)}
            placeholder="0"
          />
        </div>

        <h2 className="section-heading">Support (shown in app Support tab)</h2>

        <SupportField
          label="Phone Number"
          value={form.supportPhone}
          visible={form.supportPhoneVisible}
          onValue={(v) => update('supportPhone', v)}
          onVisible={(v) => update('supportPhoneVisible', v)}
          placeholder="+91 9876543210"
        />

        <SupportField
          label="Telegram Link"
          value={form.supportTelegram}
          visible={form.supportTelegramVisible}
          onValue={(v) => update('supportTelegram', v)}
          onVisible={(v) => update('supportTelegramVisible', v)}
          placeholder="https://t.me/yourchannel or @username"
        />

        <SupportField
          label="WhatsApp Number"
          value={form.supportWhatsapp}
          visible={form.supportWhatsappVisible}
          onValue={(v) => update('supportWhatsapp', v)}
          onVisible={(v) => update('supportWhatsappVisible', v)}
          placeholder="919876543210"
        />

        {msg && <p className={msg.includes('success') ? 'success-msg' : 'error'}>{msg}</p>}

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

function SupportField({ label, value, visible, onValue, onVisible, placeholder }) {
  return (
    <div className="field support-field">
      <div className="row-between">
        <label>{label}</label>
        <label className="visible-toggle">
          <input type="checkbox" checked={visible} onChange={(e) => onVisible(e.target.checked)} />
          <span>Show in app</span>
        </label>
      </div>
      <input type="text" value={value} onChange={(e) => onValue(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
