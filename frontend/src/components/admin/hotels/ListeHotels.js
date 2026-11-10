import React from 'react';
import CarteHotel from './HotelCard';

const ListeHotels = ({ hotels, onEditer, onSupprimer }) => {
  if (hotels.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px' }}>
        <p style={{ fontSize: '1.2em', color: '#666' }}>Aucun hôtel trouvé</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: '#fff', marginBottom: '15px' }}>Hôtels ({hotels.length})</h2>
      {hotels.map(hotel => (
        <CarteHotel key={hotel.id} hotel={hotel} onEditer={onEditer} onSupprimer={onSupprimer} />
      ))}
    </div>
  );
};

export default ListeHotels;