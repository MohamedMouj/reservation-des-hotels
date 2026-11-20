<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'client') {
            return response()->json(['message' => 'Accès réservé aux clients.'], 403);
        }

        return response()->json(
            Reservation::with(['room.hotel', 'payment'])
                ->where('user_id', $request->user()->id)
                ->latest()
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'client') {
            return response()->json(['message' => 'Seuls les clients peuvent réserver.'], 403);
        }

        $validated = $request->validate([
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'date_arrivee' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'date_depart' => ['required', 'date_format:Y-m-d', 'after:date_arrivee'],
            'nombre_personnes' => ['required', 'integer', 'min:1', 'max:5'],
            'payment_method' => ['required', 'in:'.Payment::METHOD_DEMO.','.Payment::METHOD_CASH],
        ]);

        $result = DB::transaction(function () use ($validated, $request) {
            $room = Room::with('hotel')
                ->whereKey($validated['room_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if (
                !$room->estDisponible
                || (int) $validated['nombre_personnes'] > (int) $room->capacite
                || $this->hasOverlap(
                    $room->id,
                    $validated['date_arrivee'],
                    $validated['date_depart']
                )
            ) {
                return null;
            }

            $nightlyRate = (float) $room->tarif_nuit;

            $reservation = new Reservation([
                'room_id' => $room->id,
                'date_arrivee' => $validated['date_arrivee'],
                'date_depart' => $validated['date_depart'],
                'nombre_personnes' => $validated['nombre_personnes'],
                'prix_nuit' => $nightlyRate,
                'prix_total' => 0,
                'statut' => Reservation::STATUS_CONFIRMED,
            ]);
            $reservation->prix_total = $reservation->calculerPrixTotal();
            $request->user()->reservations()->save($reservation);

            $payment = Payment::create([
                'reservation_id' => $reservation->id,
                'amount' => $validated['payment_method'] === Payment::METHOD_DEMO
                    ? $reservation->prix_total
                    : 0,
                'payment_method' => $validated['payment_method'],
                'payment_status' => Payment::STATUS_PENDING,
            ]);

            if ($payment->payment_method === Payment::METHOD_DEMO) {
                if (!$payment->processPayment()) {
                    throw new \RuntimeException('Impossible d’enregistrer le paiement de démonstration.');
                }
            }

            return $reservation->load(['room.hotel', 'payment']);
        });

        if (!$result) {
            return response()->json([
                'message' => 'Cette chambre n’est pas disponible pour les dates et le nombre de personnes choisis.',
            ], 409);
        }

        return response()->json([
            'message' => $result->payment->payment_method === Payment::METHOD_DEMO
                ? 'Réservation confirmée. Paiement de démonstration enregistré, aucun paiement réel effectué.'
                : 'Réservation confirmée. Le paiement en espèces sera à régler à l’hôtel.',
            'reservation' => $result,
        ], 201);
    }

    public function cancel(Request $request, Reservation $reservation): JsonResponse
    {
        if ($request->user()->role !== 'client') {
            return response()->json(['message' => 'Accès réservé aux clients.'], 403);
        }

        if ((int) $reservation->user_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Réservation introuvable.'], 404);
        }

        $reservation = DB::transaction(function () use ($request, $reservation) {
            $locked = Reservation::where('user_id', $request->user()->id)
                ->whereKey($reservation->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (!$locked->cancelBooking()) {
                return null;
            }

            $payment = $locked->payment;
            if (
                $payment
                && in_array($payment->payment_status, [Payment::STATUS_DEMO_PAID, Payment::STATUS_PAID], true)
                && !$payment->refund()
            ) {
                throw new \RuntimeException('Impossible de mettre à jour le statut de remboursement.');
            }

            return $locked->load(['room.hotel', 'payment']);
        });

        if (!$reservation) {
            return response()->json([
                'message' => 'Seule une réservation confirmée peut être annulée avant la date d’arrivée.',
            ], 409);
        }

        return response()->json([
            'message' => 'Réservation annulée. Le statut du paiement de démonstration a été mis à jour si nécessaire.',
            'reservation' => $reservation,
        ]);
    }

    private function hasOverlap(int $roomId, string $arrival, string $departure): bool
    {
        return Reservation::where('room_id', $roomId)
            ->where('statut', '!=', Reservation::STATUS_CANCELLED)
            ->whereDate('date_arrivee', '<', $departure)
            ->whereDate('date_depart', '>', $arrival)
            ->exists();
    }
}
