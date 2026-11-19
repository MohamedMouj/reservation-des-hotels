import React, { useCallback, useEffect, useState } from 'react';
import GestionReservations from '../../services/GestionReservations';
import messageErreur from '../../services/messageErreur';

function Users() {
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chargerUtilisateurs = useCallback(async (pageDemandee = 1) => {
    try {
      setLoading(true);
      setPagination(await GestionReservations.getUtilisateurs(pageDemandee));
      setPage(pageDemandee);
    } catch (requestError) {
      setError(messageErreur(requestError, 'Impossible de charger les utilisateurs.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerUtilisateurs(1);
  }, [chargerUtilisateurs]);

  return (
    <main className="page-container">
      <p className="eyebrow">Administration</p>
      <h1>Utilisateurs</h1>
      <p>Consultation uniquement. Les rôles ne peuvent pas être modifiés depuis cette page.</p>
      {error && <p className="feedback feedback-error" role="alert">{error}</p>}
      {loading ? (
        <p className="feedback">Chargement…</p>
      ) : (
        <>
          {!pagination?.data?.length ? (
            <p className="feedback">Aucun utilisateur trouvé.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr><th>Nom</th><th>Adresse e-mail</th><th>Téléphone</th><th>Rôle</th><th>Inscription</th></tr>
                </thead>
                <tbody>
                  {pagination.data.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.telephone || '—'}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pagination?.last_page > 1 && (
            <div className="pagination">
              <button type="button" disabled={page <= 1} onClick={() => chargerUtilisateurs(page - 1)}>Précédent</button>
              <span>Page {page} sur {pagination.last_page}</span>
              <button type="button" disabled={page >= pagination.last_page} onClick={() => chargerUtilisateurs(page + 1)}>Suivant</button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default Users;
