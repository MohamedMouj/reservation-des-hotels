import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import GestionHotelsService from '../../services/GestionHotels';
import messageErreur from '../../services/messageErreur';

const chambreInitiale = {
  type: 'Standard',
  numero: '',
  capacite: '1',
  tarif_nuit: '',
  estDisponible: true,
};

function AdminRooms() {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [formData, setFormData] = useState(chambreInitiale);
  const [chambreEditee, setChambreEditee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const chargerHotel = useCallback(async () => {
    try {
      setHotel(await GestionHotelsService.getHotel(hotelId));
    } catch (requestError) {
      setError(messageErreur(requestError, 'Impossible de charger cet hôtel.'));
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    chargerHotel();
  }, [chargerHotel]);

  function modifierChamp(event) {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function commencerModification(chambre) {
    setChambreEditee(chambre);
    setFormData({
      type: chambre.type,
      numero: String(chambre.numero),
      capacite: String(chambre.capacite),
      tarif_nuit: String(chambre.tarif_nuit),
      estDisponible: Boolean(chambre.estDisponible),
    });
  }

  function annulerModification() {
    setChambreEditee(null);
    setFormData(chambreInitiale);
  }

  async function enregistrer(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      setSaving(true);
      if (chambreEditee) {
        await GestionHotelsService.modifierChambre(hotelId, chambreEditee.id, formData);
      } else {
        await GestionHotelsService.ajouterChambre(hotelId, formData);
      }
      annulerModification();
      setMessage(chambreEditee ? 'Chambre modifiée.' : 'Chambre ajoutée.');
      await chargerHotel();
    } catch (requestError) {
      setError(messageErreur(requestError, 'La chambre n’a pas pu être enregistrée.'));
    } finally {
      setSaving(false);
    }
  }

  async function supprimer(chambre) {
    if (!window.confirm(`Supprimer la chambre ${chambre.numero} ?`)) return;

    try {
      setError('');
      await GestionHotelsService.supprimerChambre(hotelId, chambre.id);
      setMessage('Chambre supprimée.');
      await chargerHotel();
    } catch (requestError) {
      setError(messageErreur(requestError, 'La chambre n’a pas pu être supprimée.'));
    }
  }

  if (loading) return <p className="feedback">Chargement des chambres…</p>;
  if (!hotel) {
    return (
      <main className="page-container">
        <p className="feedback feedback-error" role="alert">{error || 'Hôtel introuvable.'}</p>
        <Link to="/admin">Retour aux hôtels</Link>
      </main>
    );
  }

  return (
    <main className="page-container">
      <Link to="/admin" className="back-link">← Retour aux hôtels</Link>
      <p className="eyebrow">Gestion des chambres</p>
      <h1>{hotel.nom}</h1>
      {error && <p className="feedback feedback-error" role="alert">{error}</p>}
      {message && <p className="feedback feedback-success" role="status">{message}</p>}

      <form className="booking-panel" onSubmit={enregistrer}>
        <h2>{chambreEditee ? 'Modifier une chambre' : 'Ajouter une chambre'}</h2>
        <div className="form-grid">
          <label>
            Type
            <input name="type" value={formData.type} onChange={modifierChamp} required maxLength={80} />
          </label>
          <label>
            Numéro
            <input name="numero" type="number" min="1" value={formData.numero} onChange={modifierChamp} required />
          </label>
          <label>
            Capacité
            <select name="capacite" value={formData.capacite} onChange={modifierChamp}>
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} personne(s)</option>)}
            </select>
          </label>
          <label>
            Tarif par nuit (MAD)
            <input name="tarif_nuit" type="number" min="0" value={formData.tarif_nuit} onChange={modifierChamp} required />
          </label>
        </div>
        <label className="inline-checkbox">
          <input name="estDisponible" type="checkbox" checked={formData.estDisponible} onChange={modifierChamp} />
          Chambre ouverte aux réservations
        </label>
        <div className="button-row">
          <button type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
          {chambreEditee && (
            <button type="button" className="button-secondary" onClick={annulerModification}>
              Annuler la modification
            </button>
          )}
        </div>
      </form>

      <section className="content-section">
        <h2>Chambres ({hotel.chambres.length})</h2>
        {hotel.chambres.length === 0 ? (
          <p className="feedback">Aucune chambre enregistrée.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Numéro</th><th>Type</th><th>Capacité</th><th>Tarif / nuit</th><th>État</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {hotel.chambres.map((chambre) => (
                  <tr key={chambre.id}>
                    <td>{chambre.numero}</td>
                    <td>{chambre.type}</td>
                    <td>{chambre.capacite}</td>
                    <td>{chambre.tarif_nuit} MAD</td>
                    <td>{chambre.estDisponible ? 'Ouverte' : 'Fermée'}</td>
                    <td className="action-cell">
                      <button type="button" onClick={() => commencerModification(chambre)}>Modifier</button>
                      <button type="button" className="button-danger" onClick={() => supprimer(chambre)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminRooms;
