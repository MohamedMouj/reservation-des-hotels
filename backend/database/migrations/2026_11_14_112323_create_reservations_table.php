<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('room_id')->constrained('rooms')->restrictOnDelete();
            $table->date('date_arrivee');
            $table->date('date_depart');
            $table->unsignedTinyInteger('nombre_personnes');
            $table->decimal('prix_nuit', 10, 2);
            $table->decimal('prix_total', 10, 2);
            $table->string('statut')->default('confirmee');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
