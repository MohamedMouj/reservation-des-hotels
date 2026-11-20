<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

class Reservation extends Model
{
    use HasFactory;

    public const STATUS_CONFIRMED = 'confirmee';
    public const STATUS_CANCELLED = 'annulee';

    protected $fillable = [
        'user_id',
        'room_id',
        'date_arrivee',
        'date_depart',
        'nombre_personnes',
        'prix_nuit',
        'prix_total',
        'statut',
    ];

    protected $casts = [
        'date_arrivee' => 'date',
        'date_depart' => 'date',
        'nombre_personnes' => 'integer',
        'prix_nuit' => 'decimal:2',
        'prix_total' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function calculerPrixTotal(): float
    {
        return (float) $this->prix_nuit * $this->date_arrivee->diffInDays($this->date_depart);
    }

    public function confirmBooking(): bool
    {
        if ($this->statut === self::STATUS_CANCELLED) {
            return false;
        }

        $this->statut = self::STATUS_CONFIRMED;

        return $this->save();
    }

    public function cancelBooking(): bool
    {
        if (
            $this->statut !== self::STATUS_CONFIRMED
            || !$this->date_arrivee->isAfter(Carbon::today())
        ) {
            return false;
        }

        $this->statut = self::STATUS_CANCELLED;

        return $this->save();
    }
}
