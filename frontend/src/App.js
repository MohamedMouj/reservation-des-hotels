import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/hotels')
      .then(response => {
        setHotels(response.data);
      })
      .catch(error => {
        console.error("Erreur de connexion à l'API:", error);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Nos Hôtels</h1>
      {hotels.map(hotel => (
        <div key={hotel.id} style={{ border: '1px solid #ccc', marginBottom: '20px', padding: '15px', borderRadius: '8px' }}>
          <h2>{hotel.nom} - {hotel.ville}</h2>
          <p>{hotel.description}</p>
          <p><strong>Adresse:</strong> {hotel.address}</p>
          
          <h3>Chambres:</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {hotel.chambres && hotel.chambres.map(chambre => (
              <div key={chambre.id} style={{ border: '1px solid #007BFF', padding: '10px', borderRadius: '5px', width: '200px' }}>
                <h4>Chambre N°{chambre.numero}</h4>
                <p><strong>Type:</strong> {chambre.type}</p>
                <p><strong>Capacité:</strong> {chambre.capacite} pers.</p>
                <p><strong>Tarif:</strong> {chambre.tarif_nuit} MAD / nuit</p>
                <p style={{ color: chambre.estDisponible ? 'green' : 'red', fontWeight: 'bold' }}>
                  {chambre.estDisponible ? 'Disponible' : 'Réservée'}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;