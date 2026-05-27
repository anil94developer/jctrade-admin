import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../api';
import { connectAdminSocket } from '../socket';

export default function Layout() {
  const navigate = useNavigate();

  useEffect(() => {
    const showOtp = (payload) => {
      const msg = `OTP: ${payload.otp} — ${payload.name || 'User'} (${payload.phone || '-'}) · ₹${payload.value}`;
      const el = document.createElement('div');
      el.className = 'otp-toast';
      el.textContent = msg;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 12000);
      const table = document.getElementById('tx-table');
      if (table && window.$?.fn?.dataTable && window.$(table).DataTable) {
        window.$(table).DataTable().ajax.reload(null, false);
      }
    };
    connectAdminSocket(showOtp);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">JCTRADE</div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Dashboard
          </NavLink>
          <NavLink to="/banners" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home Banners
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Users List
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Transactions
          </NavLink>
          <NavLink to="/referrals" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Referrals
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Settings
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
