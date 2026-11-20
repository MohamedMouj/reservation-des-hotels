<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class AdminReservationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Reservation::with(['user:id,name,email', 'room.hotel', 'payment'])
                ->latest()
                ->paginate(25)
        );
    }

    public function update(Request $request, Reservation $reservation): JsonResponse
    {
        $validated = $request->validate([
            'statut' => ['required', 'in:'.Reservation::STATUS_CONFIRMED.','.Reservation::STATUS_CANCELLED],
            'envoyer_email' => ['sometimes', 'boolean'],
        ]);

        $updated = DB::transaction(function () use ($reservation, $validated) {
            $locked = Reservation::whereKey($reservation->id)->lockForUpdate()->firstOrFail();

            if (
                $validated['statut'] === Reservation::STATUS_CONFIRMED
                && $locked->statut === Reservation::STATUS_CANCELLED
            ) {
                return null;
            }

            if ($validated['statut'] === Reservation::STATUS_CONFIRMED) {
                if (!$locked->confirmBooking()) {
                    return null;
                }
            } else {
                $locked->statut = Reservation::STATUS_CANCELLED;
                $locked->save();
            }

            if ($locked->statut === Reservation::STATUS_CANCELLED) {
                $payment = $locked->payment;
                if (
                    $payment
                    && in_array($payment->payment_status, [Payment::STATUS_DEMO_PAID, Payment::STATUS_PAID], true)
                    && !$payment->refund()
                ) {
                    throw new \RuntimeException('Impossible de mettre à jour le statut de remboursement.');
                }
            }

            return $locked->load(['user:id,name,email', 'room.hotel', 'payment']);
        });

        if (!$updated) {
            return response()->json([
                'message' => 'Une réservation annulée est conservée dans l’historique et ne peut pas être réactivée.',
            ], 409);
        }

        if ($request->boolean('envoyer_email')) {
            $reservation = $updated;
            Mail::raw(
                "Bonjour {$reservation->user->name},\n\n"
                ."Le statut de votre réservation à l’hôtel {$reservation->room->hotel->nom} "
                ."du {$reservation->date_arrivee->format('d/m/Y')} au {$reservation->date_depart->format('d/m/Y')} "
                ."est maintenant « {$reservation->statut} ».\n\n"
                .'L’équipe de réservation',
                function ($message) use ($reservation) {
                    $message->to($reservation->user->email)
                        ->subject('Mise à jour de votre réservation');
                }
            );
        }

        $message = 'Réservation mise à jour.';
        if ($request->boolean('envoyer_email')) {
            $message = in_array(config('mail.default'), ['log', 'array'], true)
                ? 'Réservation mise à jour. L’e-mail a été consigné par le transport local; configurez un transport de livraison pour l’envoyer.'
                : 'Réservation mise à jour et e-mail transmis au transport configuré.';
        }

        return response()->json([
            'message' => $message,
            'reservation' => $updated,
        ]);
    }

    public function confirmerPaiementEspeces(Reservation $reservation): JsonResponse
    {
        $payment = $reservation->payment;

        if (
            !$payment
            || $payment->payment_method !== Payment::METHOD_CASH
            || $payment->payment_status !== Payment::STATUS_PENDING
        ) {
            return response()->json([
                'message' => 'Seul un paiement en espèces en attente peut être confirmé.',
            ], 409);
        }

        if (!$payment->processPayment()) {
            return response()->json(['message' => 'Le paiement en espèces n’a pas pu être enregistré.'], 500);
        }

        return response()->json([
            'message' => 'Paiement en espèces marqué comme reçu par l’administrateur.',
            'payment' => $payment,
        ]);
    }

    public function confirmerRemboursementEspeces(Reservation $reservation): JsonResponse
    {
        $payment = $reservation->payment;

        if (
            !$payment
            || $payment->payment_method !== Payment::METHOD_CASH
            || $payment->payment_status !== Payment::STATUS_REFUND_PENDING
        ) {
            return response()->json([
                'message' => 'Aucun remboursement en espèces n’attend de confirmation.',
            ], 409);
        }

        $payment->payment_status = Payment::STATUS_CASH_REFUNDED;
        $payment->save();

        return response()->json([
            'message' => 'Remboursement en espèces confirmé par l’administrateur.',
            'payment' => $payment,
        ]);
    }
}
