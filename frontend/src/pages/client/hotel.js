import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import service from '../../services/GestionHotels';

function Hotel() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
        chargerHotel();
    }, [id]);

  const chargerHotel = async () => {
      try {
        setLoading(true);
        const data = await service.getHotel(id);
        setHotel(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!hotel) {
    return <div>Hôtel introuvable.</div>;
  }

  return (
    <div>
      <h2>Détails de l'hôtel</h2>
      <div>
        <h3>{hotel.nom}</h3>
        <p>{hotel.description}</p>
        <p>Ville: {hotel.ville}</p>
        <p>Adresse: {hotel.address}</p>
      </div>
    </div>
  );
}

export default Hotel;
