# Réservation des hôtels

Application de réservation avec une API Laravel 12 et une interface React.

## Démarrage local

1. Installer les dépendances PHP et préparer la configuration locale :

   ```powershell
   Set-Location backend
   composer install
   Copy-Item .env.example .env
   php artisan key:generate
   ```

2. Configurer la connexion à la base de données dans le fichier `.env` local, puis appliquer les migrations sans réinitialiser les données :

   ```powershell
   php artisan migrate
   php artisan serve
   ```

3. Dans un second terminal :

   ```powershell
   Set-Location frontend
   npm install
   npm start
   ```

L’interface utilise l’API `http://127.0.0.1:8000/api`. La création de compte publique attribue toujours le rôle client. Pour provisionner un administrateur, utiliser une procédure d’administration de base de données de confiance; aucun rôle administrateur n’est attribuable depuis l’inscription publique.

## Parcours disponibles

- Les visiteurs peuvent parcourir/rechercher les hôtels, consulter leurs chambres et avis, puis vérifier les disponibilités avec les dates et le nombre de voyageurs.
- Les clients connectés peuvent réserver une chambre, consulter leurs propres réservations, les annuler avant l’arrivée, publier des avis et indiquer un numéro de téléphone facultatif.
- Les administrateurs peuvent gérer hôtels et chambres, consulter/annuler les réservations, confirmer les règlements en espèces, consulter les utilisateurs et les statistiques.
- Les réservations, paiements et avis restent liés à leurs propriétaires. Une chambre, un hôtel ou un utilisateur avec un historique référencé ne peut pas être supprimé en cascade.

## Paiements et e-mails

Le choix « en ligne » est une **simulation de démonstration** : aucun prestataire n’est connecté, aucune carte ni donnée bancaire n’est demandée ou stockée, et aucun débit réel n’a lieu. Les règlements en espèces restent en attente jusqu’à leur confirmation par un administrateur. Une annulation d’un paiement de démonstration met à jour son statut de simulation; un remboursement en espèces doit être traité manuellement puis confirmé dans l’administration.

Le montant de réservation est calculé par l’API à partir du tarif actuel et du nombre de nuits. `Payment.amount` représente le montant effectivement enregistré comme payé, séparément de `Reservation.prix_total`. Les statistiques indiquent la valeur des réservations confirmées, pas des revenus encaissés.

L’envoi d’e-mails de changement de statut utilise le transport Laravel configuré. Avec le transport local `log` ou `array`, le message n’est pas livré à une boîte e-mail; configurer un transport de messagerie avant d’attendre une livraison réelle.

## Migrations et vérification

Le schéma des réservations existe déjà dans la base utilisée pendant le développement. Son entrée de migration était présente dans la base, mais le fichier source manquait du dépôt; il est restauré sous son nom enregistré. Les migrations suivantes ajoutent l’index de disponibilité, les paiements, les avis et le téléphone facultatif, sans supprimer ni réinitialiser les données existantes.

Ne pas utiliser `migrate:fresh` sur une base contenant des données à conserver.

```powershell
Set-Location backend
php artisan migrate:status
php artisan route:list
php artisan test

Set-Location ..\frontend
npm run build
```
