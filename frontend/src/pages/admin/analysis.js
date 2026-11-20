import React, { useEffect, useState } from 'react';
import GestionReservations from '../../services/GestionReservations';
import messageErreur from '../../services/messageErreur';

const indicateurs = [
  ['total_hotels', 'Hôtels'],
  ['total_chambres', 'Chambres'],
  ['total_users', 'Clients'],
  ['total_reservations', 'Réservations'],
  ['reservations_confirmees', 'Réservations confirmées'],
  ['reservations_annulees', 'Réservations annulées'],
  ['paiements_en_attente', 'Paiements en attente'],
];

function Analysis() {
  const [statistiques, setStatistiques] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    GestionReservations.getStatistiquesAdmin()
      .then(setStatistiques)
      .catch((requestError) => {
        setError(messageErreur(requestError, 'Impossible de charger les statistiques.'));
      });
  }, []);

  return (
    <main className="page-container">
      <p className="eyebrow">Administration</p>
      <h1>Analyse de l’activité</h1>
      {error && <p className="feedback feedback-error" role="alert">{error}</p>}
      {!statistiques && !error ? (
        <p className="feedback">Chargement des statistiques…</p>
      ) : statistiques && (
        <>
          <div className="stats-grid">
            {indicateurs.map(([key, label]) => (
              <article className="stat-card" key={key}>
                <span>{label}</span>
                <strong>{statistiques[key]}</strong>
              </article>
            ))}
          </div>
          <article className="stat-card stat-card-wide">
            <span>Valeur des réservations confirmées (pas nécessairement encaissée)</span>
            <strong>{Number(statistiques.valeur_reservations_actives).toLocaleString('fr-FR')} MAD</strong>
          </article>
        </>
      )}
    </main>
  );
}

export default Analysis;
