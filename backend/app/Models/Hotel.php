<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hotel extends Model
{
    //
    use HasFactory;
    protected $fillable = ['nom', 'address', 'description', 'ville'];

    public function chambres(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    public function avis(): HasMany
    {
        return $this->hasMany(Avis::class);
    }
}
