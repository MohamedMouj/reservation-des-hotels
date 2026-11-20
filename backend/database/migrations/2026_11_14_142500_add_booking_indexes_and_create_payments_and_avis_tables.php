<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->index(
                ['room_id', 'statut', 'date_arrivee', 'date_depart'],
                'reservations_room_status_dates_index'
            );
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')
                ->unique()
                ->constrained('reservations')
                ->restrictOnDelete();
            $table->decimal('amount', 10, 2);
            $table->date('payment_date')->nullable();
            $table->string('payment_method', 32);
            $table->string('payment_status', 32)->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');

        Schema::table('reservations', function (Blueprint $table) {
            $table->dropIndex('reservations_room_status_dates_index');
        });
    }
};
