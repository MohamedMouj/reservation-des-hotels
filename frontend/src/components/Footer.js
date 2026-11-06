import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <>
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', borderTop: '1px solid #ddd', marginTop: '40px' }}>
        <p>&copy; {new Date().getFullYear()} Réservation Hôtels. Tous droits réservés.</p>
        <Link to="/contact" style={{ textDecoration: 'none', color: '#007bff' }}>Contactez-nous</Link> 
      </footer>
    </>
  )
}

export default Footer;