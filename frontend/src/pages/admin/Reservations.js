import React, { useCallback, useEffect, useState } from 'react';
import GestionReservations from '../../services/GestionReservations';
import messageErreur from '../../services/messageErreur';

function Reservations() {
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [envoyerEmail, setEnvoyerEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const chargerReservations = useCallback(async (pageDemandee = 1) => {
    try {
      setLoading(true);
      setPagination(await GestionReservations.getReservationsAdmin(pageDemandee));
      setPage(pageDemandee);
    } catch (requestError) {
      setError(messageErreur(requestError, 'Impossible de charger les réservations.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerReservations(1);
  }, [chargerReservations]);

  async function modifierStatut(reservation, statut) {
    try {
      setError('');
      const result = await GestionReservations.modifierStatut(
        reservation.id,
        statut,
        envoyerEmail
      );
      setMessage(result.message);
      await chargerReservations();
    } catch (requestError) {
      setError(messageErreur(requestError, 'La réservation n’a pas pu être mise à jour.'));
    }
  }

  async function confirmerEspeces(reservation) {
    try {
      setError('');
      const result = await GestionReservations.confirmerPaiementEspeces(reservation.id);
      setMessage(result.message);
      await chargerReservations();
    } catch (requestError) {
      setError(messageErreur(requestError, 'Le paiement n’a pas pu être confirmé.'));
    }
  }

  async function confirmerRemboursement(reservation) {
    try {
      setError('');
      const result = await GestionReservations.confirmerRemboursementEspeces(reservation.id);
      setMessage(result.message);
      await chargerReservations();
    } catch (requestError) {
      setError(messageErreur(requestError, 'Le remboursement n’a pas pu être confirmé.'));
    }
  }

  function statutPaiement(payment) {
    const labels = {
      en_attente: 'En attente',
      payee_demo: 'Paiement de démonstration',
      payee: 'Reçu',
      remboursement_a_traiter: 'Remboursement à confirmer',
      remboursee_demo: 'Remboursé (démo)',
      remboursee: 'Remboursé en espèces',
    };
    return labels[payment?.payment_status] || 'Sans paiement';
  }

  return (
    <main className="page-container">
      <p className="eyebrow">Administration</p>
      <h1>Gestion des réservations</h1>
      <p>Les montants des réservations ne signifient pas que des fonds ont été encaissés.</p>
      <label className="inline-checkbox">
        <input
          type="checkbox"
          checked={envoyerEmail}
          onChange={(event) => setEnvoyerEmail(event.target.checked)}
        />
        Envoyer un e-mail lors du changement de statut
      </label>
      {error && <p className="feedback feedback-error" role="alert">{error}</p>}
      {message && <p className="feedback feedback-success" role="status">{message}</p>}
      {loading ? (
        <p className="feedback">Chargement…</p>
      ) : (
        <>
          {!pagination?.data?.length ? (
            <p className="feedback">Aucune réservation enregistrée.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Hôtel / chambre</th>
                    <th>Séjour</th>
                    <th>Personnes</th>
                    <th>Montant</th>
                    <th>Paiement</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.data.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>{reservation.user?.name}<br /><small>{reservation.user?.email}</small></td>
                      <td>{reservation.room?.hotel?.nom}<br /><small>Chambre {reservation.room?.numero} · {reservation.room?.type}</small></td>
                      <td>{new Date(reservation.date_arrivee).toLocaleDateString('fr-FR')}<br />au {new Date(reservation.date_depart).toLocaleDateString('fr-FR')}</td>
                      <td>{reservation.nombre_personnes}</td>
                      <td>{reservation.prix_total} MAD</td>
                      <td>
                        {reservation.payment?.payment_method === 'en_ligne_demo' ? 'Démo' : 'Espèces'}
                        <br />
                        <small>{statutPaiement(reservation.payment)}</small>
                      </td>
                      <td>{reservation.statut === 'confirmee' ? 'Confirmée' : 'Annulée'}</td>
                      <td className="action-cell">
                        {reservation.statut === 'confirmee' ? (
                          <button
                            type="button"
                            className="button-danger"
                            onClick={() => modifierStatut(reservation, 'annulee')}
                          >
                            Annuler
                          </button>
                        ) : <span>Historique conservé</span>}
                        {reservation.payment?.payment_method === 'especes'
                          && reservation.payment.payment_status === 'en_attente'
                          && reservation.statut === 'confirmee' && (
                            <button type="button" onClick={() => confirmerEspeces(reservation)}>
                              Confirmer les espèces reçues
                            </button>
                          )}
                        {reservation.payment?.payment_method === 'especes'
                          && reservation.payment.payment_status === 'remboursement_a_traiter' && (
                            <button type="button" onClick={() => confirmerRemboursement(reservation)}>
                              Confirmer le remboursement espèces
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pagination?.last_page > 1 && (
            <div className="pagination">
              <button type="button" disabled={page <= 1} onClick={() => chargerReservations(page - 1)}>
                Précédent
              </button>
              <span>Page {page} sur {pagination.last_page}</span>
              <button type="button" disabled={page >= pagination.last_page} onClick={() => chargerReservations(page + 1)}>
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default Reservations;
