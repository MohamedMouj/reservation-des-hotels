<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Avis extends Model
{
    protected $table = 'avis';

    protected $fillable = [
        'user_id',
        'hotel_id',
        'rate',
        'commentaire',
        'date',
    ];

    protected $casts = [
        'rate' => 'integer',
        'date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }
}
