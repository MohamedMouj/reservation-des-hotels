import { Outlet } from 'react-router-dom';
import AdminFooter from '../components/AdminFooter';
import AdminHeader from '../components/AdminHeader';

export default function MainLayout() {
  return (
    <div className="site-shell">
      <AdminHeader/>
      <main className="site-main">
        <Outlet />
      </main>
      <AdminFooter/>
    </div>
  );
}