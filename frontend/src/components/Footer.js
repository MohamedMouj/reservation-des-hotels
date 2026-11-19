import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <p>&copy; {new Date().getFullYear()} Réservation Hôtels. Tous droits réservés.</p>
      <Link to="/contact">Contact</Link>
      <Link to="/aboutus">À propos</Link>
    </footer>
  )
}

export default Footer;