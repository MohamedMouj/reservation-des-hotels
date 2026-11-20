import React, { useCallback, useEffect, useState } from 'react';
import GestionHotelsService from '../../services/GestionHotels';
import ListeHotels from '../../components/admin/hotels/ListeHotels';
import FormulaireHotel from '../../components/admin/hotels/FormulaireHotel';
import Statistiques from '../../components/admin/hotels/Statistique';
import messageErreur from '../../services/messageErreur';


function AdminHome() {
  const service = GestionHotelsService;
  const [hotels, setHotels] = useState([]);
  const [hotelEdit, setHotelEdit] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const chargerHotels = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await service.getToutesHotels();
      setHotels(data);
    } catch (error) {
      setError(messageErreur(error, 'Erreur lors du chargement des hôtels.'));
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    chargerHotels();
  }, [chargerHotels]);

  const ajouterHotel = async (hotelData) => {
    try {
      await service.ajouterHotel(hotelData);
      await chargerHotels();
      setMessage('Hôtel ajouté.');
      setShowForm(false);
    } catch (error) {
      setError(messageErreur(error, 'L’hôtel n’a pas pu être ajouté.'));
    }
  };

  const modifierHotel = async (id, donneesModifiees) => {
    try {
      await service.modifierHotel(id, donneesModifiees);
      await chargerHotels();
      setMessage('Hôtel modifié.');
      setHotelEdit(null);
      setShowForm(false);
    } catch (error) {
      setError(messageErreur(error, 'L’hôtel n’a pas pu être modifié.'));
    }
  };

  const supprimerHotel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet hôtel ?')) {
      try {
        await service.supprimerHotel(id);
        await chargerHotels();
        setMessage('Hôtel supprimé.');
      } catch (error) {
        setError(messageErreur(error, 'L’hôtel n’a pas pu être supprimé.'));
      }
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
        {error && <p className="feedback feedback-error" role="alert">{error}</p>}
        {message && <p className="feedback feedback-success" role="status">{message}</p>}

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

export default AdminHome;