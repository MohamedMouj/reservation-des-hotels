import api from './api';

class GestionReservations {
  async getMesReservations() {
    const response = await api.get('/reservations');
    return response.data;
  }

  async reserver(donnees) {
    const response = await api.post('/reservations', donnees);
    return response.data;
  }

  async annuler(id) {
    const response = await api.post(`/reservations/${id}/cancel`);
    return response.data;
  }

  async getReservationsAdmin(page = 1) {
    const response = await api.get('/admin/reservations', { params: { page } });
    return response.data;
  }

  async modifierStatut(id, statut, envoyerEmail) {
    const response = await api.patch(`/admin/reservations/${id}`, {
      statut,
      envoyer_email: envoyerEmail,
    });
    return response.data;
  }

  async confirmerPaiementEspeces(id) {
    const response = await api.post(`/admin/reservations/${id}/payment/cash-confirmation`);
    return response.data;
  }

  async confirmerRemboursementEspeces(id) {
    const response = await api.post(`/admin/reservations/${id}/payment/cash-refund-confirmation`);
    return response.data;
  }

  async getUtilisateurs(page = 1) {
    const response = await api.get('/admin/users', { params: { page } });
    return response.data;
  }

  async getStatistiquesAdmin() {
    const response = await api.get('/admin/analytics');
    return response.data;
  }
}

const gestionReservations = new GestionReservations();

export default gestionReservations;
