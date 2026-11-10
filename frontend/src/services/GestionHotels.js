import Hotel from '../models/hotelModel';
import api from './api';

const API_URL = '/hotels';

class GestionHotelsService {
  // READ: Fetch all hotels with their rooms from Laravel
  async getToutesHotels() {
    const response = await api.get(API_URL);
    return response.data.map(data => 
      new Hotel(data.id, data.nom, data.address, data.description, data.ville, data.chambres || [])
    );
  }

  async getHotel(id) {
    const response = await api.get(`${API_URL}/${id}`);
    return new Hotel(response.data.id, response.data.nom, response.data.address, response.data.description, response.data.ville, response.data.chambres || []);
  }

  // CREATE: Add new hotel
  async ajouterHotel(hotelData) {
    const response = await api.post(API_URL, hotelData);
    return response.data;
  }

  // UPDATE: Edit hotel
  async modifierHotel(id, donneesModifiees) {
    const response = await api.put(`${API_URL}/${id}`, donneesModifiees);
    return response.data;
  }

  // DELETE: Remove hotel
  async supprimerHotel(id) {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  }

  // CALCULATE STATS (Matches TP 02 pattern)
  getStatistiques(hotels) {
    const totalHotels = hotels.length;
    const totalChambres = hotels.reduce((sum, h) => sum + h.chambres.length, 0);
    const chambresDisponibles = hotels.reduce((sum, h) => sum + h.getNombreChambresDisponibles(), 0);
    
    const villes = {};
    hotels.forEach(h => {
      villes[h.ville] = (villes[h.ville] || 0) + 1;
    });

    const villePlusRepresentee = Object.keys(villes).reduce(
      (a, b) => (villes[a] > villes[b] ? a : b), ''
    );

    return {
      totalHotels,
      totalChambres,
      chambresDisponibles,
      villePlusRepresentee
    };
  }

  // SEARCH (Matches TP 02 pattern)
  rechercherHotels(hotels, term) {
    if (!term) return hotels;
    const lowerTerm = term.toLowerCase();
    return hotels.filter(h =>
      h.nom.toLowerCase().includes(lowerTerm) ||
      h.ville.toLowerCase().includes(lowerTerm) ||
      h.description.toLowerCase().includes(lowerTerm)
    );
  }

  filterHotelsParVille(hotels, ville) {
    if (!ville) return hotels;
    return hotels.filter(h => h.ville.toLowerCase() === ville.toLowerCase());
  }

  filterHotelsParPrix(hotels, prixMax) {
    if (!prixMax) return hotels;
    return hotels.filter(h => h.getPrixMoyenChambres() <= prixMax);
  }

  filterHotelsParDisponibilite(hotels, disponible) {
    if (disponible === undefined) return hotels;
    return hotels.filter(h => h.getNombreChambresDisponibles() > 0 === disponible);
  }

  filterHotelsParCapacite(hotels, capacite) {
    if (!capacite) return hotels;
    return hotels.filter(h => h.chambres.some(c => c.capacite >= capacite));
  }

  filterHotelsParType(hotels, type) {
    if (!type) return hotels;
    return hotels.filter(h => h.chambres.some(c => c.type === type));
  }

  filterHotelsParEtoiles(hotels, etoiles) {
    if (!etoiles) return hotels;
    return hotels.filter(h => h.etoiles === etoiles);
  }

  filterHotelsParDistanceVilleٌRepere(hotels, distanceMax) {
    if (!distanceMax) return hotels;
    return hotels.filter(h => h.distanceVilleRepere <= distanceMax);
  }
}

const gestionHotelsService = new GestionHotelsService();

export default gestionHotelsService;