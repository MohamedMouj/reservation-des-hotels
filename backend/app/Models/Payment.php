<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    public const METHOD_DEMO = 'en_ligne_demo';
    public const METHOD_CASH = 'especes';
    public const STATUS_PENDING = 'en_attente';
    public const STATUS_DEMO_PAID = 'payee_demo';
    public const STATUS_PAID = 'payee';
    public const STATUS_REFUND_PENDING = 'remboursement_a_traiter';
    public const STATUS_REFUNDED = 'remboursee_demo';
    public const STATUS_CASH_REFUNDED = 'remboursee';

    protected $fillable = [
        'reservation_id',
        'amount',
        'payment_date',
        'payment_method',
        'payment_status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function processPayment(): bool
    {
        if (
            !in_array($this->payment_method, [self::METHOD_DEMO, self::METHOD_CASH], true)
            || $this->payment_status !== self::STATUS_PENDING
        ) {
            return false;
        }

        $this->amount = $this->reservation->prix_total;
        $this->payment_status = $this->payment_method === self::METHOD_DEMO
            ? self::STATUS_DEMO_PAID
            : self::STATUS_PAID;
        $this->payment_date = now()->toDateString();

        return $this->save();
    }

    public function refund(): bool
    {
        if (
            $this->payment_method === self::METHOD_CASH
            && $this->payment_status === self::STATUS_PAID
        ) {
            $this->payment_status = self::STATUS_REFUND_PENDING;
        } elseif (
            $this->payment_method === self::METHOD_DEMO
            && $this->payment_status === self::STATUS_DEMO_PAID
        ) {
            $this->payment_status = self::STATUS_REFUNDED;
        } else {
            return false;
        }

        return $this->save();
    }
}
