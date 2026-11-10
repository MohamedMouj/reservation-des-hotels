import { Link } from 'react-router-dom'

function Header() {
  return (
    <>
      <header style={{ padding: '15px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>Réservation Hôtel</Link>
        </div>
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="users" style={{ textDecoration: 'none', color: '#007bff' }}>Manage users</Link>
          <Link to="analysis" style={{ textDecoration: 'none', color: '#007bff' }}>Analysis</Link>
          <Link to="/admin" style={{ textDecoration: 'none', color: '#007bff' }}>Manage hotels</Link>
          <Link to="reservations" style={{ textDecoration: 'none', color: '#007bff' }}>Reservations</Link>

          <span style={{ margin: '0 10px', color: '#666' }}>|</span>
          <span style={{ color: '#666' }}>Espace Admin</span>
        </nav>
      </header>
    </>
  )
}

export default Header
