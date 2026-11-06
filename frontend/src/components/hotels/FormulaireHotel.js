import React, { useState, useEffect } from 'react';

const FormulaireHotel = ({ hotel, onAjouter, onModifier, onAnnuler }) => {
  const [formData, setFormData] = useState({
    nom: '',
    address: '',
    description: '',
    ville: ''
  });

  useEffect(() => {
    if (hotel) {
      setFormData({
        nom: hotel.nom,
        address: hotel.address,
        description: hotel.description,
        ville: hotel.ville
      });
    }
  }, [hotel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hotel) {
      onModifier(hotel.id, formData);
    } else {
      onAjouter(formData);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', marginBottom: '25px' }}>
      <h2>{hotel ? 'Modifier l\'Hôtel' : 'Nouvel Hôtel'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Nom de l'hôtel:</label>
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Ville:</label>
          <input type="text" name="ville" value={formData.ville} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Adresse:</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', minHeight: '80px' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ padding: '10px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {hotel ? 'Modifier' : 'Ajouter'}
          </button>
          <button type="button" onClick={onAnnuler} style={{ padding: '10px 20px', background: '#757575', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormulaireHotel;