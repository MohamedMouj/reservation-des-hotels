<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminAnalyticsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'total_hotels' => Hotel::count(),
            'total_chambres' => Room::count(),
            'total_users' => User::where('role', 'client')->count(),
            'total_reservations' => Reservation::count(),
            'reservations_confirmees' => Reservation::where('statut', Reservation::STATUS_CONFIRMED)->count(),
            'reservations_annulees' => Reservation::where('statut', Reservation::STATUS_CANCELLED)->count(),
            'valeur_reservations_actives' => Reservation::where('statut', Reservation::STATUS_CONFIRMED)
                ->sum('prix_total'),
            'paiements_en_attente' => Payment::where('payment_status', Payment::STATUS_PENDING)->count(),
        ]);
    }
}
