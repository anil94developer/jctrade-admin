import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

const emptyForm = {
  walletAddress: '',
  usdtPrice: '',
  buyUsdtPrice: '',
  binancePrice: '',
  maintenanceMode: false,
  referralReward: '',
  referralBaseUrl: '',
  sellCashbackPercent: '0.4',
  buyCashbackPercent: '0.3',
  supportPhone: '',
  supportTelegram: '',
  supportWhatsapp: '',
  supportPhoneVisible: true,
  supportTelegramVisible: true,
  supportWhatsappVisible: true,
  paymentQrVisible: true,
  paymentQrImage: '',
  buyPaymentModes: 'both',
  buyCdmBankName: '',
  buyCdmAccountNumber: '',
  buyCdmIfsc: '',
  buyCdmAccountHolder: '',
  buyCdmInstructions: '',
};

export default function Settings() {
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    api('/settings')
      .then((d) =>
        setForm({
          walletAddress: d.walletAddress || '',
          usdtPrice: String(d.usdtPrice ?? ''),
          buyUsdtPrice: String(d.buyUsdtPrice ?? d.usdtPrice ?? ''),
          binancePrice: String(d.binancePrice ?? ''),
          maintenanceMode: Boolean(d.maintenanceMode),
          referralReward: String(d.referralReward ?? ''),
          referralBaseUrl: d.referralBaseUrl || '',
          sellCashbackPercent: String(d.sellCashbackPercent ?? '0.4'),
          buyCashbackPercent: String(d.buyCashbackPercent ?? '0.3'),
          supportPhone: d.supportPhone || '',
          supportTelegram: d.supportTelegram || '',
          supportWhatsapp: d.supportWhatsapp || '',
          supportPhoneVisible: d.supportPhoneVisible !== false,
          supportTelegramVisible: d.supportTelegramVisible !== false,
          supportWhatsappVisible: d.supportWhatsappVisible !== false,
          paymentQrVisible: d.paymentQrVisible !== false,
          paymentQrImage: d.paymentQrImage || '',
          buyPaymentModes: d.buyPaymentModes || 'both',
          buyCdmBankName: d.buyCdmBankName || '',
          buyCdmAccountNumber: d.buyCdmAccountNumber || '',
          buyCdmIfsc: d.buyCdmIfsc || '',
          buyCdmAccountHolder: d.buyCdmAccountHolder || '',
          buyCdmInstructions: d.buyCdmInstructions || '',
        })
      )
      .catch(console.error);
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

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

  async function saveQrToServer(dataUrl) {
    await api('/settings/payment-qr', {
      method: 'PUT',
      body: JSON.stringify({ image: dataUrl, visible: form.paymentQrVisible }),
    });
  }

  async function onQrFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMsg('Please upload an image file (PNG/JPG)');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const dataUrl = await compressImageFile(file);
      update('paymentQrImage', dataUrl);
      await saveQrToServer(dataUrl);
      setMsg('QR uploaded and saved to server');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setMsg(err.message || 'QR upload failed');
    } finally {
      setLoading(false);
    }
  }

  async function clearQr() {
    update('paymentQrImage', '');
    if (fileRef.current) fileRef.current.value = '';
    try {
      await api('/settings/payment-qr', {
        method: 'PUT',
        body: JSON.stringify({ image: '', visible: form.paymentQrVisible }),
      });
      setMsg('QR removed');
    } catch (err) {
      setMsg(err.message);
    }
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
          buyUsdtPrice: Number(form.buyUsdtPrice),
          binancePrice: Number(form.binancePrice),
          maintenanceMode: form.maintenanceMode,
          referralReward: Number(form.referralReward),
          referralBaseUrl: form.referralBaseUrl,
          sellCashbackPercent: Number(form.sellCashbackPercent),
          buyCashbackPercent: Number(form.buyCashbackPercent),
          supportPhone: form.supportPhone,
          supportTelegram: form.supportTelegram,
          supportWhatsapp: form.supportWhatsapp,
          supportPhoneVisible: form.supportPhoneVisible,
          supportTelegramVisible: form.supportTelegramVisible,
          supportWhatsappVisible: form.supportWhatsappVisible,
          paymentQrVisible: form.paymentQrVisible,
          ...(form.paymentQrImage ? { paymentQrImage: form.paymentQrImage } : {}),
          buyPaymentModes: form.buyPaymentModes,
          buyCdmBankName: form.buyCdmBankName,
          buyCdmAccountNumber: form.buyCdmAccountNumber,
          buyCdmIfsc: form.buyCdmIfsc,
          buyCdmAccountHolder: form.buyCdmAccountHolder,
          buyCdmInstructions: form.buyCdmInstructions,
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

        <div className="field-row">
          <div className="field">
            <label>Sell USDT price (INR) — users sell to you</label>
            <input
              type="number"
              step="0.01"
              value={form.usdtPrice}
              onChange={(e) => update('usdtPrice', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Buy USDT price (INR) — users buy from you</label>
            <input
              type="number"
              step="0.01"
              value={form.buyUsdtPrice}
              onChange={(e) => update('buyUsdtPrice', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label>Binance reference price (INR)</label>
          <input
            type="number"
            step="0.01"
            value={form.binancePrice}
            onChange={(e) => update('binancePrice', e.target.value)}
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

        <h2 className="section-heading">Buy USDT — payment methods</h2>
        <p className="field-hint" style={{ marginBottom: 12 }}>
          Control what users see on the Buy page. UPI slots are managed under Payment UPIs.
        </p>
        <div className="field">
          <label>Allowed buy payment options</label>
          <select value={form.buyPaymentModes} onChange={(e) => update('buyPaymentModes', e.target.value)}>
            <option value="both">UPI + CDM (user chooses)</option>
            <option value="upi">UPI only</option>
            <option value="cdm">CDM only</option>
          </select>
        </div>
        <div className="field-row">
          <div className="field">
            <label>CDM bank name</label>
            <input
              type="text"
              value={form.buyCdmBankName}
              onChange={(e) => update('buyCdmBankName', e.target.value)}
              placeholder="e.g. HDFC Bank"
            />
          </div>
          <div className="field">
            <label>Account holder name</label>
            <input
              type="text"
              value={form.buyCdmAccountHolder}
              onChange={(e) => update('buyCdmAccountHolder', e.target.value)}
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Account number</label>
            <input
              type="text"
              value={form.buyCdmAccountNumber}
              onChange={(e) => update('buyCdmAccountNumber', e.target.value)}
            />
          </div>
          <div className="field">
            <label>IFSC</label>
            <input type="text" value={form.buyCdmIfsc} onChange={(e) => update('buyCdmIfsc', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>CDM instructions (shown to user)</label>
          <textarea
            rows={3}
            value={form.buyCdmInstructions}
            onChange={(e) => update('buyCdmInstructions', e.target.value)}
            placeholder="How to deposit via CDM..."
          />
        </div>

        <h2 className="section-heading">Payment QR (UPI tab)</h2>

        <div className="field row-between">
          <div>
            <label>Show QR in app</label>
            <p className="field-hint">Displayed on the UPI / payment screen</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={form.paymentQrVisible}
              onChange={(e) => update('paymentQrVisible', e.target.checked)}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="field">
          <label>Upload QR image</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={onQrFile} />
          {form.paymentQrImage ? (
            <div className="qr-preview-wrap">
              <img src={form.paymentQrImage} alt="Payment QR preview" className="qr-preview" />
              <button type="button" className="btn btn-secondary btn-sm" onClick={clearQr}>
                Remove QR
              </button>
            </div>
          ) : (
            <p className="field-hint">PNG or JPG, max ~1.5MB</p>
          )}
        </div>

        <h2 className="section-heading">Referral program</h2>

        <div className="field">
          <label>Referral bonus (₹ per first approved sell)</label>
          <input
            type="number"
            step="0.01"
            value={form.referralReward}
            onChange={(e) => update('referralReward', e.target.value)}
            placeholder="50"
          />
        </div>

        <div className="field">
          <label>Referral signup base URL</label>
          <p className="field-hint">App adds ?ref=UID — e.g. https://yourapp.com/login</p>
          <input
            type="url"
            value={form.referralBaseUrl}
            onChange={(e) => update('referralBaseUrl', e.target.value)}
            placeholder="https://your-app.onrender.com/login"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Sell USDT cashback %</label>
            <input
              type="number"
              step="0.1"
              value={form.sellCashbackPercent}
              onChange={(e) => update('sellCashbackPercent', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Buy INR cashback %</label>
            <input
              type="number"
              step="0.1"
              value={form.buyCashbackPercent}
              onChange={(e) => update('buyCashbackPercent', e.target.value)}
            />
          </div>
        </div>

        <h2 className="section-heading">Support (shown in app)</h2>

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
