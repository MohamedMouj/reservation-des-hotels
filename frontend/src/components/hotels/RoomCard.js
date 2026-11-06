import React from 'react';

export default function RoomCard({ chambre }) {
  return (
    <div style={{ border: '1px solid #007BFF', padding: '10px', borderRadius: '5px', width: '200px' }}>
      <h4>Chambre N°{chambre.numero}</h4>
      <p><strong>Type:</strong> {chambre.type}</p>
      <p><strong>Capacité:</strong> {chambre.capacite} pers.</p>
      <p><strong>Tarif:</strong> {chambre.tarif_nuit} MAD / nuit</p>
      <p style={{ color: chambre.estDisponible ? 'green' : 'red', fontWeight: 'bold' }}>
        {chambre.estDisponible ? 'Disponible' : 'Réservée'}
      </p>
    </div>
  );
}