import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import GestionAuth from '../../services/Auth';
import GestionHotelsService from '../../services/GestionHotels';
import GestionReservations from '../../services/GestionReservations';
import messageErreur from '../../services/messageErreur';

function Hotel() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [hotel, setHotel] = useState(null);
  const [avis, setAvis] = useState([]);
  const [dateArrivee, setDateArrivee] = useState(searchParams.get('date_arrivee') || '');
  const [dateDepart, setDateDepart] = useState(searchParams.get('date_depart') || '');
  const [nombrePersonnes, setNombrePersonnes] = useState(searchParams.get('nombre_personnes') || '1');
  const [chambresDisponibles, setChambresDisponibles] = useState([]);
  const [chambreChoisie, setChambreChoisie] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('en_ligne_demo');
  const [note, setNote] = useState('5');
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function chargerHotel() {
      try {
        setLoading(true);
        const [hotelData, avisData] = await Promise.all([
          GestionHotelsService.getHotel(id),
          GestionHotelsService.getAvis(id),
        ]);
        setHotel(hotelData);
        setAvis(avisData.data);
      } catch (requestError) {
        setError(messageErreur(requestError, 'Impossible de charger cet hôtel.'));
      } finally {
        setLoading(false);
      }
    }

    chargerHotel();
  }, [id]);

  async function rechercherDisponibilites(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setChambreChoisie(null);

    try {
      const chambres = await GestionHotelsService.rechercherChambresDisponibles({
        date_arrivee: dateArrivee,
        date_depart: dateDepart,
        nombre_personnes: nombrePersonnes,
      });
      setChambresDisponibles(chambres.filter((chambre) => Number(chambre.hotel_id) === Number(id)));
    } catch (requestError) {
      setError(messageErreur(requestError, 'Impossible de rechercher les chambres.'));
    }
  }

  async function reserver(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!GestionAuth.isAuthenticated() || GestionAuth.getUser()?.role !== 'client') {
      setError('Connectez-vous avec un compte client pour réserver.');
      return;
    }

    try {
      setSending(true);
      const result = await GestionReservations.reserver({
        room_id: chambreChoisie.id,
        date_arrivee: dateArrivee,
        date_depart: dateDepart,
        nombre_personnes: Number(nombrePersonnes),
        payment_method: paymentMethod,
      });
      setMessage(result.message);
      setChambreChoisie(null);
    } catch (requestError) {
      setError(messageErreur(requestError, 'La réservation n’a pas pu être enregistrée.'));
    } finally {
      setSending(false);
    }
  }

  async function publierAvis(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!GestionAuth.isAuthenticated() || GestionAuth.getUser()?.role !== 'client') {
      setError('Connectez-vous avec un compte client pour publier un avis.');
      return;
    }

    try {
      const response = await GestionHotelsService.ajouterAvis(id, {
        rate: Number(note),
        commentaire,
      });
      setAvis((current) => [response.avis, ...current]);
      setCommentaire('');
      setMessage(response.message);
    } catch (requestError) {
      setError(messageErreur(requestError, 'Votre avis n’a pas pu être publié.'));
    }
  }

  if (loading) return <p className="feedback">Chargement de l’hôtel…</p>;
  if (!hotel) return <p className="feedback feedback-error" role="alert">{error || 'Hôtel introuvable.'}</p>;

  return (
    <div className="page-container">
      <section className="hotel-detail">
        <p className="eyebrow">{hotel.ville} · {hotel.address}</p>
        <h1>{hotel.nom}</h1>
        <p>{hotel.description}</p>
        <p>{hotel.avisCount || avis.length} avis · {hotel.chambres.length} chambre(s) référencée(s)</p>
      </section>

      <section className="content-section">
        <h2>Rechercher une chambre</h2>
        <form className="search-panel search-panel-compact" onSubmit={rechercherDisponibilites}>
          <label>
            Arrivée
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={dateArrivee}
              onChange={(event) => setDateArrivee(event.target.value)}
              required
            />
          </label>
          <label>
            Départ
            <input
              type="date"
              min={dateArrivee || new Date().toISOString().slice(0, 10)}
              value={dateDepart}
              onChange={(event) => setDateDepart(event.target.value)}
              required
            />
          </label>
          <label>
            Voyageurs
            <select value={nombrePersonnes} onChange={(event) => setNombrePersonnes(event.target.value)}>
              {[1, 2, 3, 4, 5].map((nombre) => (
                <option key={nombre} value={nombre}>{nombre}</option>
              ))}
            </select>
          </label>
          <button type="submit">Vérifier la disponibilité</button>
        </form>

        {error && <p className="feedback feedback-error" role="alert">{error}</p>}
        {message && <p className="feedback feedback-success" role="status">{message}</p>}

        <div className="room-grid">
          {chambresDisponibles.map((chambre) => (
            <article className="room-card" key={chambre.id}>
              <h3>{chambre.type} · Chambre {chambre.numero}</h3>
              <p>Jusqu’à {chambre.capacite} personne(s)</p>
              <p className="hotel-price">{chambre.tarif_nuit} MAD <span>/ nuit</span></p>
              <button type="button" onClick={() => setChambreChoisie(chambre)}>
                Réserver cette chambre
              </button>
            </article>
          ))}
        </div>
        {chambresDisponibles.length === 0 && (
          <p className="feedback">Lancez une recherche pour afficher les chambres disponibles pour vos dates.</p>
        )}

        {chambreChoisie && (
          <form className="booking-panel" onSubmit={reserver}>
            <h3>Finaliser la réservation</h3>
            <p>{chambreChoisie.type} · {dateArrivee} au {dateDepart} · {nombrePersonnes} voyageur(s)</p>
            <label>
              Mode de paiement
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option value="en_ligne_demo">Paiement en ligne de démonstration (aucun débit réel)</option>
                <option value="especes">Espèces à l’hôtel</option>
              </select>
            </label>
            <div className="button-row">
              <button type="submit" disabled={sending}>
                {sending ? 'Enregistrement…' : 'Confirmer la réservation'}
              </button>
              <button type="button" className="button-secondary" onClick={() => setChambreChoisie(null)}>
                Annuler
              </button>
            </div>
            {!GestionAuth.isAuthenticated() && (
              <p><Link to="/login">Se connecter</Link> pour continuer.</p>
            )}
          </form>
        )}
      </section>

      <section className="content-section">
        <h2>Avis des voyageurs ({avis.length})</h2>
        {avis.length === 0 ? (
          <p className="feedback">Aucun avis pour le moment.</p>
        ) : (
          <div className="review-list">
            {avis.map((review) => (
              <article className="review-card" key={review.id}>
                <strong>{review.user?.name || 'Voyageur'} · {'★'.repeat(review.rate)}</strong>
                <p>{review.commentaire}</p>
                <small>{new Date(review.date).toLocaleDateString('fr-FR')}</small>
              </article>
            ))}
          </div>
        )}

        <form className="booking-panel" onSubmit={publierAvis}>
          <h3>Évaluer cet hôtel</h3>
          <label>
            Note
            <select value={note} onChange={(event) => setNote(event.target.value)}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>{value} / 5</option>
              ))}
            </select>
          </label>
          <label>
            Votre commentaire
            <textarea
              value={commentaire}
              onChange={(event) => setCommentaire(event.target.value)}
              maxLength={2000}
              required
            />
          </label>
          <button type="submit">Publier mon avis</button>
        </form>
      </section>
    </div>
  );
}

export default Hotel;
