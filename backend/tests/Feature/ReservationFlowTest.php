<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReservationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_uses_server_owned_price_and_creates_demo_payment(): void
    {
        $client = User::factory()->create();
        $attacker = User::factory()->create();
        $room = $this->createRoom();
        Sanctum::actingAs($client);

        $arrival = now()->addDays(3)->toDateString();
        $departure = now()->addDays(5)->toDateString();

        $response = $this->postJson('/api/reservations', [
            'room_id' => $room->id,
            'date_arrivee' => $arrival,
            'date_depart' => $departure,
            'nombre_personnes' => 2,
            'payment_method' => Payment::METHOD_DEMO,
            'user_id' => $attacker->id,
            'prix_nuit' => 1,
            'prix_total' => 2,
            'statut' => Reservation::STATUS_CANCELLED,
            'payment_status' => 'payee',
        ]);

        $response->assertCreated()
            ->assertJsonPath('reservation.user_id', $client->id)
            ->assertJsonPath('reservation.prix_nuit', '120.00')
            ->assertJsonPath('reservation.prix_total', '240.00')
            ->assertJsonPath('reservation.statut', Reservation::STATUS_CONFIRMED)
            ->assertJsonPath('reservation.payment.amount', '240.00')
            ->assertJsonPath('reservation.payment.payment_status', Payment::STATUS_DEMO_PAID);

        $this->assertDatabaseHas('reservations', [
            'user_id' => $client->id,
            'room_id' => $room->id,
            'prix_total' => 240,
            'statut' => Reservation::STATUS_CONFIRMED,
        ]);
        $this->assertDatabaseMissing('reservations', ['user_id' => $attacker->id]);
    }

    public function test_availability_excludes_overlaps_and_allows_adjacent_dates(): void
    {
        $client = User::factory()->create();
        $room = $this->createRoom();
        $arrival = now()->addDays(5)->toDateString();
        $departure = now()->addDays(7)->toDateString();

        Reservation::create([
            'user_id' => $client->id,
            'room_id' => $room->id,
            'date_arrivee' => $arrival,
            'date_depart' => $departure,
            'nombre_personnes' => 2,
            'prix_nuit' => 120,
            'prix_total' => 240,
        ]);

        $overlapStart = now()->addDays(6)->toDateString();
        $overlapEnd = now()->addDays(8)->toDateString();
        $this->getJson('/api/rooms/availability?'.http_build_query([
            'date_arrivee' => $overlapStart,
            'date_depart' => $overlapEnd,
            'nombre_personnes' => 1,
        ]))->assertOk()->assertJsonCount(0);

        $adjacentEnd = now()->addDays(9)->toDateString();
        $this->getJson('/api/rooms/availability?'.http_build_query([
            'date_arrivee' => $departure,
            'date_depart' => $adjacentEnd,
            'nombre_personnes' => 1,
        ]))->assertOk()->assertJsonCount(1);
    }

    public function test_booking_validates_dates_and_room_capacity(): void
    {
        $client = User::factory()->create();
        $room = $this->createRoom(1);
        Sanctum::actingAs($client);

        $arrival = now()->addDays(3)->toDateString();
        $this->postJson('/api/reservations', [
            'room_id' => $room->id,
            'date_arrivee' => $arrival,
            'date_depart' => $arrival,
            'nombre_personnes' => 2,
            'payment_method' => Payment::METHOD_CASH,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['date_depart']);

        $this->postJson('/api/reservations', [
            'room_id' => $room->id,
            'date_arrivee' => $arrival,
            'date_depart' => now()->addDays(4)->toDateString(),
            'nombre_personnes' => 2,
            'payment_method' => Payment::METHOD_CASH,
        ])->assertConflict();
    }

    public function test_only_owner_can_cancel_before_arrival_and_demo_payment_is_refunded(): void
    {
        $owner = User::factory()->create();
        $otherClient = User::factory()->create();
        $room = $this->createRoom();
        $arrival = now()->addDays(4)->toDateString();
        $reservation = Reservation::create([
            'user_id' => $owner->id,
            'room_id' => $room->id,
            'date_arrivee' => $arrival,
            'date_depart' => now()->addDays(6)->toDateString(),
            'nombre_personnes' => 2,
            'prix_nuit' => 120,
            'prix_total' => 240,
        ]);
        Payment::create([
            'reservation_id' => $reservation->id,
            'amount' => 240,
            'payment_method' => Payment::METHOD_DEMO,
            'payment_status' => Payment::STATUS_DEMO_PAID,
            'payment_date' => now()->toDateString(),
        ]);

        Sanctum::actingAs($owner);
        $this->getJson('/api/reservations')->assertOk()->assertJsonCount(1);

        Sanctum::actingAs($otherClient);
        $this->postJson("/api/reservations/{$reservation->id}/cancel")->assertNotFound();

        Sanctum::actingAs($owner);
        $this->postJson("/api/reservations/{$reservation->id}/cancel")
            ->assertOk()
            ->assertJsonPath('reservation.statut', Reservation::STATUS_CANCELLED)
            ->assertJsonPath('reservation.payment.payment_status', Payment::STATUS_REFUNDED);

        $this->getJson('/api/rooms/availability?'.http_build_query([
            'date_arrivee' => $arrival,
            'date_depart' => now()->addDays(6)->toDateString(),
            'nombre_personnes' => 1,
        ]))->assertOk()->assertJsonCount(1);
    }

    public function test_client_cannot_cancel_on_or_after_arrival(): void
    {
        $client = User::factory()->create();
        $room = $this->createRoom();
        $reservation = Reservation::create([
            'user_id' => $client->id,
            'room_id' => $room->id,
            'date_arrivee' => now()->toDateString(),
            'date_depart' => now()->addDays(2)->toDateString(),
            'nombre_personnes' => 2,
            'prix_nuit' => 120,
            'prix_total' => 240,
        ]);

        Sanctum::actingAs($client);
        $this->postJson("/api/reservations/{$reservation->id}/cancel")
            ->assertConflict()
            ->assertJsonPath('message', 'Seule une réservation confirmée peut être annulée avant la date d’arrivée.');

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'statut' => Reservation::STATUS_CONFIRMED,
        ]);
    }

    public function test_cash_payment_is_confirmed_by_admin_and_refund_is_manual_after_cancellation(): void
    {
        $client = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $room = $this->createRoom();
        $arrival = now()->addDays(8)->toDateString();
        $departure = now()->addDays(10)->toDateString();

        Sanctum::actingAs($client);
        $booking = $this->postJson('/api/reservations', [
            'room_id' => $room->id,
            'date_arrivee' => $arrival,
            'date_depart' => $departure,
            'nombre_personnes' => 1,
            'payment_method' => Payment::METHOD_CASH,
        ])->assertCreated()
            ->assertJsonPath('reservation.payment.amount', '0.00')
            ->assertJsonPath('reservation.payment.payment_status', Payment::STATUS_PENDING);
        $reservationId = $booking->json('reservation.id');

        $this->postJson('/api/reservations', [
            'room_id' => $room->id,
            'date_arrivee' => $arrival,
            'date_depart' => $departure,
            'nombre_personnes' => 1,
            'payment_method' => Payment::METHOD_CASH,
        ])->assertConflict();

        Sanctum::actingAs($admin);
        $this->postJson("/api/admin/reservations/{$reservationId}/payment/cash-confirmation")
            ->assertOk()
            ->assertJsonPath('payment.amount', '240.00')
            ->assertJsonPath('payment.payment_status', Payment::STATUS_PAID);

        Sanctum::actingAs($client);
        $this->postJson("/api/reservations/{$reservationId}/cancel")
            ->assertOk()
            ->assertJsonPath('reservation.payment.payment_status', Payment::STATUS_REFUND_PENDING);

        Sanctum::actingAs($admin);
        $this->postJson("/api/admin/reservations/{$reservationId}/payment/cash-refund-confirmation")
            ->assertOk()
            ->assertJsonPath('payment.payment_status', Payment::STATUS_CASH_REFUNDED);
    }

    public function test_client_can_review_hotel_but_cannot_supply_identity_or_date(): void
    {
        $client = User::factory()->create();
        $anotherClient = User::factory()->create();
        $hotel = Hotel::create([
            'nom' => 'Hôtel Atlas',
            'address' => '12 rue Centrale',
            'description' => 'Un hôtel de test.',
            'ville' => 'Rabat',
        ]);
        Sanctum::actingAs($client);

        $this->postJson("/api/hotels/{$hotel->id}/avis", [
            'rate' => 5,
            'commentaire' => 'Très bon séjour.',
            'user_id' => $anotherClient->id,
            'date' => '2000-01-01',
        ])->assertCreated()
            ->assertJsonPath('avis.user_id', $client->id)
            ->assertJsonPath('avis.date', now()->startOfDay()->toJSON());

        $this->assertDatabaseHas('avis', [
            'hotel_id' => $hotel->id,
            'user_id' => $client->id,
            'rate' => 5,
        ]);
    }

    public function test_reservation_history_prevents_room_and_hotel_deletion(): void
    {
        $client = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $room = $this->createRoom();
        $reservation = Reservation::create([
            'user_id' => $client->id,
            'room_id' => $room->id,
            'date_arrivee' => now()->addDays(3)->toDateString(),
            'date_depart' => now()->addDays(4)->toDateString(),
            'nombre_personnes' => 1,
            'prix_nuit' => 120,
            'prix_total' => 120,
        ]);

        Sanctum::actingAs($admin);
        $this->deleteJson("/api/hotels/{$room->hotel_id}/rooms/{$room->id}")
            ->assertConflict();
        $this->deleteJson("/api/hotels/{$room->hotel_id}")->assertConflict();

        $this->assertDatabaseHas('reservations', ['id' => $reservation->id]);
        $this->assertDatabaseHas('rooms', ['id' => $room->id]);
        $this->assertDatabaseHas('hotels', ['id' => $room->hotel_id]);
    }

    private function createRoom(int $capacity = 2): Room
    {
        $hotel = Hotel::create([
            'nom' => 'Hôtel Atlas',
            'address' => '12 rue Centrale',
            'description' => 'Un hôtel de test.',
            'ville' => 'Rabat',
        ]);

        return Room::create([
            'hotel_id' => $hotel->id,
            'type' => 'Standard',
            'numero' => 101,
            'capacite' => (string) $capacity,
            'tarif_nuit' => 120,
            'estDisponible' => true,
        ]);
    }
}
