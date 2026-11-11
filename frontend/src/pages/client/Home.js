import React, { useState, useEffect } from 'react'
import gestionHotelsService from "../../services/GestionHotels"
import { Link } from 'react-router-dom'

function Home() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    chargerHotels();
  }, [])

  const chargerHotels=async () => {
    try {
      setLoading(true);
      const data = await gestionHotelsService.getToutesHotels();
      setHotels(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p>Chargement en cours...</p>
  }

  if (error) {
    return <p>Une erreur est survenue: {error}</p>
  }

  return (
    <>
      <nav>
        <h1>Bienvenue sur notre site de réservation d'hôtels</h1>
        <p>
          Nous vous offrons la possibilité de réserver des hôtels facilement et
          rapidement. Explorez nos options et trouvez l'hébergement parfait pour
          votre prochain voyage.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
          <input type='text' placeholder='Search for hotel' />
        </div>
      </nav>

      <aside
        style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '5px',
          position: 'fixed',
          top: '300px',
          left: '0',
          bottom: '0',
          width: '25%',
          height: '100%',
          zIndex: '1000',
        }}
      >
        <h2>Filtres</h2>
        <div>
          <h3>Ville</h3>
          <select>
            <option value=''>Toutes les villes</option>
            <option value='paris'>Paris</option>
            <option value='lyon'>Lyon</option>
            <option value='marseille'>Marseille</option>
          </select>
        </div>
        <div>
          <h3>Prix</h3>
          <ul>
            <li>
              <input type='checkbox' id='prix0' name='prix0' value='0' />
              <label htmlFor='prix0'>Tous les prix</label>
            </li>
            <li>
              <input type='checkbox' id='prix1' name='prix1' value='20' />
              <label htmlFor='prix1'>Moins de 20€</label>
            </li>
            <li>
              <input type='checkbox' id='prix2' name='prix2' value='50' />
              <label htmlFor='prix2'>Moins de 50€</label>
            </li>
            <li>
              <input type='checkbox' id='prix3' name='prix3' value='100' />
              <label htmlFor='prix3'>Moins de 200€</label>
            </li>
          </ul>
        </div>
      </aside>

      <div>
        <h2>Liste des hôtels disponibles</h2>
        <p>Voici la liste des hôtels disponibles à la réservation :</p>
        <div>
          {hotels.map((hotel)=>{
            return (
              <div key={hotel.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                <h3>{hotel.nom}</h3>
                <p>Ville: {hotel.ville}</p>
                <p>Prix: {hotel.prix}€</p>
                <Link to={`/hotel/${hotel.id}`}>details</Link><br/>
                <button>Réserver</button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default Home
