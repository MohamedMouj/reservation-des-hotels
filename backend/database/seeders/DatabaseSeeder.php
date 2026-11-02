<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Hotel;
use App\Models\Room;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    
        // Create a Hotel
        $hotel = Hotel::create([
            'nom' => 'Hotel de l\'Atlas',
            'address' => 'Boulevard Hassan II',
            'description' => 'Un hôtel luxueux au centre-ville avec vue panoramique.',
            'ville' => 'Agadir'
        ]);

        // Create Rooms (Rooms) for this Hotel
        Room::create([
            'hotel_id' => $hotel->id,
            'type' => 'Suite',
            'numero' => 101,
            'capacite' => '2',
            'tarif_nuit' => 1200,
            'estDisponible' => true
        ]);

        Room::create([
            'hotel_id' => $hotel->id,
            'type' => 'Standard',
            'numero' => 102,
            'capacite' => '1',
            'tarif_nuit' => 500,
            'estDisponible' => true
        ]);
    
    }
}
