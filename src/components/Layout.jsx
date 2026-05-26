import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../api';

export default function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">JCTRADE</div>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Dashboard
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
