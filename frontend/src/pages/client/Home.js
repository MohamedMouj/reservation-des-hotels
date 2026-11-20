import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import GestionHotelsService from '../../services/GestionHotels';
import messageErreur from '../../services/messageErreur';

const destinations = [
  { ville: 'Marrakech', image: '/images/destination-marrakech.jpg', classe: 'destination-large' },
  { ville: 'Casablanca', image: '/images/destination-morocco.jpg', classe: 'destination-large' },
  { ville: 'Tanger', image: '/images/destination-beach.jpg', classe: '' },
  { ville: 'Agadir', image: '/images/destination-beach.jpg', classe: '' },
  { ville: 'Paris', image: '/images/destination-paris.jpg', classe: '' },
];

const imagesHoteles = {
  agadir: '/images/destination-beach.jpg',
  casa: '/images/destination-morocco.jpg',
  casablanca: '/images/destination-morocco.jpg',
  marrakech: '/images/destination-marrakech.jpg',
  paris: '/images/destination-paris.jpg',
  taroudant: '/images/destination-marrakech.jpg',
  tanger: '/images/destination-beach.jpg',
  tangier: '/images/destination-beach.jpg',
};

function normaliser(texte = '') {
  return String(texte || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function dateApres(date) {
  const lendemain = new Date(`${date}T00:00:00`);
  lendemain.setDate(lendemain.getDate() + 1);
  return [
    lendemain.getFullYear(),
    String(lendemain.getMonth() + 1).padStart(2, '0'),
    String(lendemain.getDate()).padStart(2, '0'),
  ].join('-');
}

function imageHotel(hotel = {}) {
  const ville = normaliser(hotel.ville);
  const entree = Object.keys(imagesHoteles).find((cle) => ville.includes(cle));
  return imagesHoteles[entree] || '/images/hotel-resort.jpg';
}

function Home() {
  const [hotels, setHotels] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [ville, setVille] = useState('');
  const [dateArrivee, setDateArrivee] = useState('');
  const [dateDepart, setDateDepart] = useState('');
  const [nombrePersonnes, setNombrePersonnes] = useState('1');
  const [chambresDisponibles, setChambresDisponibles] = useState(null);
  const [rechercheRecente, setRechercheRecente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function chargerHotels() {
      try {
        setHotels(await GestionHotelsService.getToutesHotels());
      } catch (requestError) {
        setError(messageErreur(requestError, 'Impossible de charger les hôtels.'));
      } finally {
        setLoading(false);
      }
    }

    chargerHotels();
  }, []);

  const villes = useMemo(
    () => [...new Set(hotels.map((hotel) => hotel.ville).filter(Boolean))].sort(),
    [hotels]
  );
  const hotelsFiltres = useMemo(() => {
    const terme = normaliser(recherche);
    return hotels.filter((hotel) => {
      const nomVille = normaliser(hotel.ville);
      const correspondVille = !ville || nomVille === normaliser(ville);
      const correspondRecherche = !terme
        || [hotel.nom, hotel.ville, hotel.description]
          .some((champ) => normaliser(champ).includes(terme))
        || (nomVille && terme.includes(nomVille));
      return correspondVille && correspondRecherche;
    });
  }, [hotels, recherche, ville]);

  async function rechercherDisponibilites(event) {
    event.preventDefault();
    setError('');
    setChambresDisponibles(null);

    if (!dateArrivee || !dateDepart || dateDepart <= dateArrivee) {
      setError('Choisissez les dates d’arrivée et de départ pour rechercher les chambres.');
      return;
    }

    try {
      setRechercheEnCours(true);
      const chambres = await GestionHotelsService.rechercherChambresDisponibles({
        date_arrivee: dateArrivee,
        date_depart: dateDepart,
        nombre_personnes: nombrePersonnes,
      });
      const terme = normaliser(recherche);
      const chambresFiltrees = chambres.filter((chambre) => {
        if (!terme) return true;
        const hotel = normaliser(chambre.hotel?.nom || '');
        const destination = normaliser(chambre.hotel?.ville || '');
        return hotel.includes(terme) || destination.includes(terme) || terme.includes(destination);
      });
      setChambresDisponibles(chambresFiltrees);
      setRechercheRecente({
        destination: recherche || ville || 'Toutes les destinations',
        arrivee: dateArrivee,
        depart: dateDepart,
        voyageurs: nombrePersonnes,
      });
    } catch (requestError) {
      setError(messageErreur(requestError, 'Impossible de rechercher les disponibilités.'));
    } finally {
      setRechercheEnCours(false);
    }
  }

  function choisirDestination(nomVille) {
    setRecherche(nomVille);
    setVille('');
  }

  if (loading) return <p className="feedback">Chargement des hôtels…</p>;

  return (
    <div className="home-page">
      <section className="home-search-section" id="home-search">
        <div className="home-search-heading">
          <p className="home-kicker">Réservez votre prochaine escapade</p>
          <h1>Un séjour qui vous ressemble</h1>
          <p>Comparez les hôtels et trouvez une chambre disponible au Maroc et ailleurs.</p>
        </div>

        <form className="home-search-form" onSubmit={rechercherDisponibilites}>
          <label className="home-search-field">
            <span className="home-field-icon" aria-hidden="true">⌖</span>
            <span className="home-field-content">
              <span className="home-field-title">Destination</span>
              <input
                type="search"
                placeholder="Ville ou nom d’hôtel"
                value={recherche}
                onChange={(event) => setRecherche(event.target.value)}
              />
            </span>
          </label>
          <label className="home-search-field">
            <span className="home-field-icon" aria-hidden="true">↗</span>
            <span className="home-field-content">
              <span className="home-field-title">Arrivée</span>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={dateArrivee}
                onChange={(event) => {
                  const nouvelleArrivee = event.target.value;
                  setDateArrivee(nouvelleArrivee);
                  if (dateDepart && dateDepart <= nouvelleArrivee) setDateDepart('');
                }}
                required
              />
            </span>
          </label>
          <label className="home-search-field">
            <span className="home-field-icon" aria-hidden="true">↙</span>
            <span className="home-field-content">
              <span className="home-field-title">Départ</span>
              <input
                type="date"
                min={dateArrivee ? dateApres(dateArrivee) : new Date().toISOString().slice(0, 10)}
                value={dateDepart}
                onChange={(event) => setDateDepart(event.target.value)}
                required
              />
            </span>
          </label>
          <label className="home-search-field home-guests-field">
            <span className="home-field-icon" aria-hidden="true">♙</span>
            <span className="home-field-content">
              <span className="home-field-title">Voyageurs</span>
              <select
                value={nombrePersonnes}
                onChange={(event) => setNombrePersonnes(event.target.value)}
              >
                {[1, 2, 3, 4, 5].map((nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre} {nombre > 1 ? 'voyageurs' : 'voyageur'}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <button className="home-search-button" type="submit" disabled={rechercheEnCours}>
            {rechercheEnCours ? 'Recherche…' : 'Rechercher'}
          </button>
        </form>

        <div className="home-search-options">
          <span>Réservation flexible · Paiement de démonstration disponible</span>
        </div>
        {error && <p className="feedback feedback-error" role="alert">{error}</p>}
      </section>

      {rechercheRecente && (
        <section className="home-section home-recent-section" aria-labelledby="recent-heading">
          <div className="home-section-heading">
            <div>
              <h2 id="recent-heading">Votre recherche récente</h2>
              <p>Reprenez votre recherche là où vous l’avez laissée.</p>
            </div>
          </div>
          <button
            type="button"
            className="recent-search-card"
            onClick={() => document.getElementById('home-search')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <img src="/images/destination-marrakech.jpg" alt="" />
            <span>
              <strong>{rechercheRecente.destination}</strong>
              <small>
                {new Date(`${rechercheRecente.arrivee}T00:00:00`).toLocaleDateString('fr-FR')}
                {' – '}
                {new Date(`${rechercheRecente.depart}T00:00:00`).toLocaleDateString('fr-FR')}
                {' · '}
                {rechercheRecente.voyageurs} voyageur(s)
              </small>
            </span>
            <span className="recent-search-arrow" aria-hidden="true">›</span>
          </button>
        </section>
      )}

      {chambresDisponibles && (
        <section className="home-section" aria-labelledby="availability-heading">
          <div className="home-section-heading">
            <div>
              <p className="home-kicker">Pour vos dates</p>
              <h2 id="availability-heading">Chambres disponibles</h2>
            </div>
            <span className="home-result-count">{chambresDisponibles.length} résultat(s)</span>
          </div>
          {chambresDisponibles.length === 0 ? (
            <p className="feedback">Aucune chambre ne correspond à ces dates et à cette destination.</p>
          ) : (
            <div className="home-property-grid">
              {chambresDisponibles.map((chambre) => (
                <article className="home-property-card" key={chambre.id}>
                  <img
                    className="home-property-image"
                    src={imageHotel(chambre.hotel)}
                    alt={`Hôtel ${chambre.hotel?.nom || ''} à ${chambre.hotel?.ville || ''}`}
                  />
                  <div className="home-property-body">
                    <p className="home-property-location">{chambre.hotel?.ville}</p>
                    <h3>{chambre.hotel?.nom}</h3>
                    <p>{chambre.type} · Chambre {chambre.numero} · {chambre.capacite} personne(s)</p>
                    <div className="home-property-bottom">
                      <strong>{chambre.tarif_nuit} MAD <small>/ nuit</small></strong>
                      <Link
                        className="home-property-link"
                        to={`/hotel/${chambre.hotel_id}?date_arrivee=${dateArrivee}&date_depart=${dateDepart}&nombre_personnes=${nombrePersonnes}`}
                      >
                        Voir l’hôtel
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="home-section home-offers-section" aria-labelledby="offers-heading">
        <div className="home-section-heading">
          <div>
            <p className="home-kicker">Un voyage en tête ?</p>
            <h2 id="offers-heading">Nos idées pour partir</h2>
            <p>Des inspirations pour votre prochain séjour.</p>
          </div>
        </div>
        <div className="home-offers-grid">
          <article className="home-offer-card home-offer-morocco">
            <img src="/images/destination-morocco.jpg" alt="" />
            <div>
              <span className="home-offer-label">Escapade marocaine</span>
              <h3>Changez de décor le temps d’un séjour</h3>
              <p>Découvrez des adresses de charme et choisissez vos dates.</p>
              <a href="#home-destinations" className="home-offer-link">Explorer les destinations <span>→</span></a>
            </div>
          </article>
          <article className="home-offer-card home-offer-stay">
            <img src="/images/hotel-pool.jpg" alt="" />
            <div>
              <span className="home-offer-label">Voyagez simplement</span>
              <h3>Votre prochaine pause commence ici</h3>
              <p>Comparez les chambres et réservez selon vos envies.</p>
              <a href="#home-properties" className="home-offer-link">Voir les hôtels <span>→</span></a>
            </div>
          </article>
        </div>
      </section>

      <section className="home-section" id="home-destinations" aria-labelledby="destinations-heading">
        <div className="home-section-heading">
          <div>
            <p className="home-kicker">Un peu d’inspiration</p>
            <h2 id="destinations-heading">Destinations tendance</h2>
            <p>Des villes à explorer pour votre prochain voyage.</p>
          </div>
        </div>
        <div className="home-destination-grid">
          {destinations.map((destination) => (
            <a
              className={`home-destination-card ${destination.classe}`}
              href="#home-properties"
              key={destination.ville}
              onClick={() => choisirDestination(destination.ville)}
            >
              <img src={destination.image} alt="" loading="lazy" />
              <span className="home-destination-overlay" />
              <span className="home-destination-name">
                {destination.ville}
                <span aria-hidden="true">↗</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="home-section home-properties-section" id="home-properties" aria-labelledby="properties-heading">
        <div className="home-section-heading home-properties-heading">
          <div>
            <p className="home-kicker">Des adresses choisies pour vous</p>
            <h2 id="properties-heading">Séjournez dans des lieux uniques</h2>
            <p>Découvrez les hébergements disponibles sur notre plateforme.</p>
          </div>
          <label className="home-city-filter">
            <span>Filtrer par ville</span>
            <select value={ville} onChange={(event) => setVille(event.target.value)}>
              <option value="">Toutes les villes</option>
              {villes.map((nomVille) => (
                <option key={nomVille} value={nomVille}>{nomVille}</option>
              ))}
            </select>
          </label>
        </div>

        {hotelsFiltres.length === 0 ? (
          <p className="feedback">Aucun hôtel ne correspond à votre recherche. Essayez une autre destination.</p>
        ) : (
          <div className="home-property-grid">
            {hotelsFiltres.map((hotel) => (
              <article className="home-property-card" key={hotel.id}>
                <Link to={`/hotel/${hotel.id}`} className="home-property-photo-link" aria-label={`Découvrir ${hotel.nom}`}>
                  <img
                    className="home-property-image"
                    src={imageHotel(hotel)}
                    alt={`Vue de ${hotel.ville}`}
                    loading="lazy"
                  />
                  <span className="home-property-heart" aria-hidden="true">♡</span>
                </Link>
                <div className="home-property-body">
                  <div className="home-property-title-row">
                    <div>
                      <p className="home-property-location">{hotel.ville}</p>
                      <h3>{hotel.nom}</h3>
                    </div>
                    <span className="home-review-badge">
                      {hotel.avisCount > 0 ? `★ ${hotel.avisCount} avis` : 'Nouveau'}
                    </span>
                  </div>
                  <p className="home-property-description">{hotel.description}</p>
                  <div className="home-property-bottom">
                    <span>
                      <strong>
                        {hotel.chambres.length ? `${hotel.getTarifMoyen()} MAD` : 'Tarif sur demande'}
                      </strong>
                      {hotel.chambres.length > 0 && <small> / nuit</small>}
                    </span>
                    <Link className="home-property-link" to={`/hotel/${hotel.id}`}>Découvrir</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
