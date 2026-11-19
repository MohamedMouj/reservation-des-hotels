<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function availability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date_arrivee' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'date_depart' => ['required', 'date_format:Y-m-d', 'after:date_arrivee'],
            'nombre_personnes' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $rooms = Room::with('hotel')
            ->where('estDisponible', true)
            ->where('capacite', '>=', $validated['nombre_personnes'])
            ->whereDoesntHave('reservations', function ($query) use ($validated) {
                $query->where('statut', '!=', Reservation::STATUS_CANCELLED)
                    ->whereDate('date_arrivee', '<', $validated['date_depart'])
                    ->whereDate('date_depart', '>', $validated['date_arrivee']);
            })
            ->orderBy('tarif_nuit')
            ->get();

        return response()->json($rooms);
    }

    public function index(Hotel $hotel): JsonResponse
    {
        return response()->json($hotel->chambres()->orderBy('numero')->get());
    }

    public function store(Request $request, Hotel $hotel): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'max:80'],
            'numero' => ['required', 'integer', 'min:1'],
            'capacite' => ['required', 'integer', 'between:1,5'],
            'tarif_nuit' => ['required', 'integer', 'min:0'],
            'estDisponible' => ['sometimes', 'boolean'],
        ]);

        $room = $hotel->chambres()->create($validated + ['estDisponible' => true]);

        return response()->json($room, 201);
    }

    public function update(Request $request, Hotel $hotel, Room $room): JsonResponse
    {
        if ((int) $room->hotel_id !== (int) $hotel->id) {
            return response()->json(['message' => 'Chambre introuvable pour cet hôtel.'], 404);
        }

        $validated = $request->validate([
            'type' => ['sometimes', 'required', 'string', 'max:80'],
            'numero' => ['sometimes', 'required', 'integer', 'min:1'],
            'capacite' => ['sometimes', 'required', 'integer', 'between:1,5'],
            'tarif_nuit' => ['sometimes', 'required', 'integer', 'min:0'],
            'estDisponible' => ['sometimes', 'boolean'],
        ]);

        $room->update($validated);

        return response()->json($room->fresh());
    }

    public function destroy(Hotel $hotel, Room $room): JsonResponse
    {
        if ((int) $room->hotel_id !== (int) $hotel->id) {
            return response()->json(['message' => 'Chambre introuvable pour cet hôtel.'], 404);
        }

        try {
            $room->delete();
        } catch (QueryException) {
            return response()->json([
                'message' => 'Cette chambre ne peut pas être supprimée car elle possède un historique de réservations.',
            ], 409);
        }

        return response()->json(null, 204);
    }
}
