import { Outlet, Link } from 'react-router-dom';
import AdminFooter from '../components/AdminFooter';
import AdminHeader from '../components/AdminHeader';

export default function MainLayout() {
  return (
    <div style={{ fontFamily: 'sans-serif', margin: '0 auto' }}>
      <AdminHeader/>

      <main style={{ padding: '20px' }}>
        {/* The current page gets injected here */}
        <Outlet /> 
      </main>

      <AdminFooter/>
    </div>
  );
}