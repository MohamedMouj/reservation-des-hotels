import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GestionAuth from '../../services/Auth';
import GestionReservations from '../../services/GestionReservations';
import messageErreur from '../../services/messageErreur';

function ClientReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function chargerReservations() {
    try {
      setReservations(await GestionReservations.getMesReservations());
    } catch (requestError) {
      setError(messageErreur(requestError, 'Impossible de charger vos réservations.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (GestionAuth.isAuthenticated() && GestionAuth.getUser()?.role === 'client') {
      chargerReservations();
    } else {
      setLoading(false);
    }
  }, []);

  async function annuler(reservation) {
    if (!window.confirm('Confirmer l’annulation de cette réservation ?')) return;

    try {
      setError('');
      const response = await GestionReservations.annuler(reservation.id);
      setMessage(response.message);
      await chargerReservations();
    } catch (requestError) {
      setError(messageErreur(requestError, 'La réservation n’a pas pu être annulée.'));
    }
  }

  if (!GestionAuth.isAuthenticated() || GestionAuth.getUser()?.role !== 'client') {
    return (
      <main className="page-container">
        <h1>Mes réservations</h1>
        <p>Connectez-vous avec un compte client pour consulter vos réservations.</p>
        <Link className="button-link" to="/login">Se connecter</Link>
      </main>
    );
  }

  if (loading) return <p className="feedback">Chargement de vos réservations…</p>;

  return (
    <main className="page-container">
      <p className="eyebrow">Espace client</p>
      <h1>Mes réservations</h1>
      {error && <p className="feedback feedback-error" role="alert">{error}</p>}
      {message && <p className="feedback feedback-success" role="status">{message}</p>}

      {reservations.length === 0 ? (
        <section className="empty-state">
          <h2>Vous n’avez pas encore de réservation</h2>
          <p>Parcourez les hôtels et trouvez une chambre pour votre prochain séjour.</p>
          <Link className="button-link" to="/">Découvrir les hôtels</Link>
        </section>
      ) : (
        <div className="reservation-list">
          {reservations.map((reservation) => {
            const arrival = reservation.date_arrivee.slice(0, 10);
            const cancellable = reservation.statut === 'confirmee'
              && arrival > new Date().toISOString().slice(0, 10);
            const paymentLabels = {
              en_attente: 'En attente de règlement à l’hôtel',
              payee_demo: 'Paiement de démonstration (aucun débit réel)',
              payee: 'Reçu',
              remboursement_a_traiter: 'Remboursement espèces à confirmer',
              remboursee_demo: 'Remboursé (démo)',
              remboursee: 'Remboursé en espèces',
            };

            return (
              <article className="reservation-card" key={reservation.id}>
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Réservation #{reservation.id}</p>
                    <h2>{reservation.room?.hotel?.nom || 'Hôtel'}</h2>
                  </div>
                  <span className={`status-badge status-${reservation.statut}`}>
                    {reservation.statut === 'confirmee' ? 'Confirmée' : 'Annulée'}
                  </span>
                </div>
                <p>Chambre {reservation.room?.numero} · {reservation.room?.type}</p>
                <p>Du {new Date(arrival).toLocaleDateString('fr-FR')} au {new Date(reservation.date_depart).toLocaleDateString('fr-FR')}</p>
                <p>{reservation.nombre_personnes} voyageur(s) · {reservation.prix_nuit} MAD / nuit · Total : <strong>{reservation.prix_total} MAD</strong></p>
                <p>
                  Paiement : {reservation.payment?.payment_method === 'en_ligne_demo'
                    ? 'Démonstration sans débit réel'
                    : 'Espèces à l’hôtel'}
                  {' · '}
                  {paymentLabels[reservation.payment?.payment_status] || 'En attente'}
                </p>
                {cancellable && (
                  <button type="button" className="button-danger" onClick={() => annuler(reservation)}>
                    Annuler la réservation
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default ClientReservations;
