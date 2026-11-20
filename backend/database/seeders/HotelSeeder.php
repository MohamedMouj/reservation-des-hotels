<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\Room;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HotelSeeder extends Seeder
{
    public function run(): void
    {
        $hotels = [
            [
                'nom' => 'Hôtel Alizé du Souss',
                'ville' => 'Agadir',
                'address' => 'Boulevard du 20 Août, Secteur Touristique, Agadir',
                'description' => 'Hébergement dans le secteur touristique d’Agadir, adapté aux séjours balnéaires en couple ou en famille.',
                'legacy' => [
                    'id' => 2,
                    'ville' => 'agadir',
                    'description' => 'ffg',
                ],
                'chambres' => [
                    ['numero' => 12, 'type' => 'Chambre double standard', 'capacite' => 2, 'tarif_nuit' => 690],
                    ['numero' => 13, 'type' => 'Chambre twin', 'capacite' => 2, 'tarif_nuit' => 750],
                    ['numero' => 14, 'type' => 'Chambre familiale', 'capacite' => 4, 'tarif_nuit' => 1400],
                    ['numero' => 21, 'type' => 'Chambre simple', 'capacite' => 1, 'tarif_nuit' => 500],
                ],
            ],
            [
                'nom' => 'Riad Dar Tifawine',
                'ville' => 'Taroudant',
                'address' => 'Médina, près de Bab Targhount, Taroudant',
                'description' => 'Maison d’hôtes près de la médina et des remparts, pour les couples et les familles qui découvrent Taroudant.',
                'legacy' => [
                    'id' => 3,
                    'ville' => 'Taroudant',
                    'description' => 'Hôtel avec belle vue et à des prix raisonnables',
                ],
                'chambres' => [
                    ['numero' => 101, 'type' => 'Chambre simple', 'capacite' => 1, 'tarif_nuit' => 420],
                    ['numero' => 102, 'type' => 'Chambre double', 'capacite' => 2, 'tarif_nuit' => 650],
                    ['numero' => 103, 'type' => 'Suite familiale', 'capacite' => 4, 'tarif_nuit' => 1200],
                ],
            ],
            [
                'nom' => 'Hôtel Anfa Centre',
                'ville' => 'Casablanca',
                'address' => 'Boulevard d’Anfa, centre-ville, Casablanca',
                'description' => 'Hôtel urbain proche des quartiers d’affaires et des transports, adapté aux déplacements professionnels et aux courts séjours.',
                'legacy' => [
                    'id' => 4,
                    'ville' => 'Casa',
                    'description' => 'fdnkfdn',
                ],
                'chambres' => [
                    ['numero' => 201, 'type' => 'Chambre simple affaires', 'capacite' => 1, 'tarif_nuit' => 720],
                    ['numero' => 202, 'type' => 'Chambre double standard', 'capacite' => 2, 'tarif_nuit' => 980],
                    ['numero' => 203, 'type' => 'Chambre executive', 'capacite' => 3, 'tarif_nuit' => 1650],
                ],
            ],
            [
                'nom' => 'Résidence Corniche Ain Diab',
                'ville' => 'Casablanca',
                'address' => 'Corniche d’Aïn Diab, Casablanca',
                'description' => 'Résidence près de la Corniche d’Aïn Diab, avec des chambres adaptées aux couples et aux familles en séjour prolongé.',
                'legacy' => [
                    'id' => 5,
                    'ville' => 'Casa',
                    'description' => 'fgfg',
                ],
                'chambres' => [
                    ['numero' => 301, 'type' => 'Studio double', 'capacite' => 2, 'tarif_nuit' => 1050],
                    ['numero' => 302, 'type' => 'Suite junior', 'capacite' => 3, 'tarif_nuit' => 1650],
                    ['numero' => 303, 'type' => 'Suite familiale', 'capacite' => 4, 'tarif_nuit' => 2100],
                ],
            ],
            [
                'nom' => 'Dar Les Remparts',
                'ville' => 'Taroudant',
                'address' => 'Quartier de la Kasbah, Taroudant',
                'description' => 'Hébergement calme près de la médina, pour les voyageurs qui souhaitent visiter les souks et les remparts.',
                'legacy' => [
                    'id' => 6,
                    'ville' => 'Taroudant',
                    'description' => 'dfvfvfv',
                ],
                'chambres' => [
                    ['numero' => 401, 'type' => 'Chambre simple', 'capacite' => 1, 'tarif_nuit' => 400],
                    ['numero' => 402, 'type' => 'Chambre double', 'capacite' => 2, 'tarif_nuit' => 650],
                    ['numero' => 403, 'type' => 'Suite familiale', 'capacite' => 4, 'tarif_nuit' => 1250],
                ],
            ],
        ];

        DB::transaction(function () use ($hotels): void {
            foreach ($hotels as $data) {
                $attributes = [
                    'nom' => $data['nom'],
                    'ville' => $data['ville'],
                    'address' => $data['address'],
                    'description' => $data['description'],
                ];
                $legacy = Hotel::query()
                    ->whereKey($data['legacy']['id'])
                    ->where('ville', $data['legacy']['ville'])
                    ->where('description', $data['legacy']['description'])
                    ->first();

                $hotel = $legacy ?? Hotel::firstOrNew([
                    'nom' => $attributes['nom'],
                    'ville' => $attributes['ville'],
                ]);
                $hotel->fill($attributes);
                $hotel->save();

                foreach ($data['chambres'] as $roomData) {
                    Room::updateOrCreate(
                        ['hotel_id' => $hotel->id, 'numero' => $roomData['numero']],
                        $roomData + ['estDisponible' => true]
                    );
                }
            }
        });
    }
}
