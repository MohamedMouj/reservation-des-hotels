import React from 'react';

const CarteHotel = ({ hotel, onEditer, onSupprimer }) => {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', pb: '10px' }}>
        <h3>{hotel.nom} <span style={{ fontSize: '0.8em', color: '#666', fontWeight: 'normal' }}>({hotel.ville})</span></h3>
        <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: '15px', fontSize: '0.85em', fontWeight: 'bold' }}>
          {hotel.getNombreChambresDisponibles()} chambres dispo
        </span>
      </div>

      <p style={{ margin: '15px 0', color: '#555' }}>{hotel.description}</p>
      <p style={{ fontSize: '0.9em', color: '#777' }}><strong>Adresse:</strong> {hotel.address}</p>

      <h4 style={{ marginTop: '15px', marginBottom: '10px' }}>Chambres:</h4>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {hotel.chambres.length === 0 ? (
          <p style={{ fontSize: '0.85em', color: '#999' }}>Aucune chambre enregistrée.</p>
        ) : (
          hotel.chambres.map(chambre => (
            <div key={chambre.id} style={{ border: '1px solid #bbdefb', padding: '10px', borderRadius: '6px', background: '#f1f8fe', minWidth: '160px' }}>
              <strong>N° {chambre.numero}</strong> ({chambre.type})
              <div style={{ fontSize: '0.85em', marginTop: '5px' }}>{chambre.tarif_nuit} MAD / nuit</div>
              <div style={{ fontSize: '0.8em', color: chambre.estDisponible ? 'green' : 'red', fontWeight: 'bold' }}>
                {chambre.estDisponible ? 'Disponible' : 'Réservée'}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => onEditer(hotel)} style={{ padding: '8px 15px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Modifier
        </button>
        <button onClick={() => onSupprimer(hotel.id)} style={{ padding: '8px 15px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default CarteHotel;