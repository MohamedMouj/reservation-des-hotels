import React from 'react';

const Statistiques = ({ stats }) => {
  return (
    <div className="statistiques" style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2>Tableau de Bord</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginTop: '15px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{stats.totalHotels}</div>
          <div>Total Hôtels</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #2196F3, #1E88E5)', color: '#fff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{stats.totalChambres}</div>
          <div>Total Chambres</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #4CAF50, #8BC34A)', color: '#fff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{stats.chambresDisponibles}</div>
          <div>Chambres Libres</div>
        </div>
      </div>
      {stats.villePlusRepresentee && (
        <div style={{ marginTop: '15px', textAlign: 'center', color: '#555' }}>
          Ville principale: <strong>{stats.villePlusRepresentee}</strong>
        </div>
      )}
    </div>
  );
};

export default Statistiques;