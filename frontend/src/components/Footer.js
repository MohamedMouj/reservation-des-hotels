import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <>
      <footer style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', borderTop: '1px solid #ddd', marginTop: '40px', position: 'fixed', bottom: 0, left: 0, width: '100%' }}>
        <p>&copy; {new Date().getFullYear()} Réservation Hôtels. Tous droits réservés.</p>
        <Link to="/contact" style={{ textDecoration: 'none', color: '#007bff' }}>Contactez-nous</Link> 
        <Link to="/aboutus" style={{ textDecoration: 'none', color: '#007bff' }}>AboutUs</Link> 
      </footer>
    </>
  )
}

export default Footer;