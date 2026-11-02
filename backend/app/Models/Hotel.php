<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Hotel extends Model
{
    //
    use HasFactory;
    protected $fillable = ['nom', 'address', 'description', 'ville'];

    public function chambres()
    {
        return $this->hasMany(Room::class);
    }
}
