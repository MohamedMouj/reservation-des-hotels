import React from 'react'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <>
      <header style={{ padding: '15px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>Réservation Hôtel</Link>
        </div>
        <nav>
          <Link to="/login" style={{ marginRight: '15px', textDecoration: 'none', color: '#007bff' }}>Connexion</Link>
          <Link to="/register" style={{ textDecoration: 'none', color: '#007bff' }}>Inscription</Link>
          <span style={{ margin: '0 10px', color: '#666' }}>|</span>
          <span style={{ color: '#666' }}>Espace Client</span>
        </nav>
      </header>
    </>
  )
}

export default Header
