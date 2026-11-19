class Hotel {
  constructor(id, nom, address, description, ville, chambres = [], avis = [], avisCount = null) {
    this.id = id;
    this.nom = nom;
    this.address = address;
    this.description = description;
    this.ville = ville;
    this.chambres = chambres;
    this.avis = avis;
    this.avisCount = avisCount ?? avis.length;
  }

  // Returns number of available rooms
  getNombreChambresDisponibles() {
    return this.chambres.filter(c => c.estDisponible).length;
  }

  // Calculates average rate of rooms
  getTarifMoyen() {
    if (this.chambres.length === 0) return 0;
    const total = this.chambres.reduce((sum, c) => sum + Number(c.tarif_nuit), 0);
    return Math.round(total / this.chambres.length);
  }
}

export default Hotel;