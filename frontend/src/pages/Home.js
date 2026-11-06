import React, { useEffect, useState } from 'react';
import GestionHotelsService from '../services/GestionHotels';
import ListeHotels from '../components/hotels/ListeHotels';
import FormulaireHotel from '../components/hotels/FormulaireHotel';
import Statistiques from '../components/hotels/Statistique';


function App() {
  const service = GestionHotelsService;
  const [hotels, setHotels] = useState([]);
  const [hotelEdit, setHotelEdit] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerHotels();
  }, []);

  const chargerHotels = async () => {
    try {
      setLoading(true);
      const data = await service.getToutesHotels();
      setHotels(data);
    } catch (error) {
      console.error("Erreur lors du chargement des hôtels:", error);
    } finally {
      setLoading(false);
    }
  };

  const ajouterHotel = async (hotelData) => {
    await service.ajouterHotel(hotelData);
    chargerHotels();
    setShowForm(false);
  };

  const modifierHotel = async (id, donneesModifiees) => {
    await service.modifierHotel(id, donneesModifiees);
    chargerHotels();
    setHotelEdit(null);
    setShowForm(false);
  };

  const supprimerHotel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet hôtel ?')) {
      await service.supprimerHotel(id);
      chargerHotels();
    }
  };

  const editerHotel = (hotel) => {
    setHotelEdit(hotel);
    setShowForm(true);
  };

  const annulerEdition = () => {
    setHotelEdit(null);
    setShowForm(false);
  };

  const hotelsFiltres = service.rechercherHotels(hotels, recherche);
  const stats = service.getStatistiques(hotels);

  return (
    <div className="app" >
      <header className="app-header" style={{ padding: '30px', textAlign: 'center', color: '#fff' }}>
        <h1>Gestion des Hôtels</h1>
        <p>Plateforme de réservation et catalogue d'hôtels</p>
      </header>

      <div className="app-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <Statistiques stats={stats} />

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Rechercher par nom, ville ou description..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{ flex: 1, padding: '12px 15px', borderRadius: '8px', border: 'none', fontSize: '1rem' }}
          />
          {!showForm && (
            <button onClick={() => setShowForm(true)} style={{ padding: '12px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Ajouter un Hôtel
            </button>
          )}
        </div>

        {showForm && (
          <FormulaireHotel hotel={hotelEdit} onAjouter={ajouterHotel} onModifier={modifierHotel} onAnnuler={annulerEdition} />
        )}

        {loading ? (
          <div style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>Chargement...</div>
        ) : (
          <ListeHotels hotels={hotelsFiltres} onEditer={editerHotel} onSupprimer={supprimerHotel} />
        )}
      </div>
    </div>
  );
}

export default App;