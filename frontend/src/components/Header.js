import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GestionAuth from "../services/Auth";
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [connecte, setConnecte] = useState(GestionAuth.isAuthenticated());

  useEffect(() => {
    setConnecte(GestionAuth.isAuthenticated());
  }, [location.pathname]);

  async function handleLogout() {
    try {
      await GestionAuth.logout();
    } catch (error) {
      console.error("La déconnexion côté serveur a échoué.", error);
    }

    setConnecte(false);
    navigate("/", { replace: true });
  }

  return (
    <>
      <header
        style={{
          padding: "15px 20px",
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
          <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
            Réservation Hôtel
          </Link>
        </div>
        <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {connecte ? (
            <button type="button" onClick={handleLogout}>
              Déconnexion
            </button>
          ) : (
            <>
              <Link to="/login">Connexion</Link>
              <Link to="/register">Inscription</Link>
            </>
          )}
          <Link
            to="/clientreservations"
            style={{ textDecoration: "none", color: "#007bff" }}
          >
            Reservations
          </Link>

          <span style={{ margin: "0 10px", color: "#666" }}>|</span>
          <span style={{ color: "#666" }}>Espace Client</span>
        </nav>
      </header>
    </>
  );
}

export default Header;
