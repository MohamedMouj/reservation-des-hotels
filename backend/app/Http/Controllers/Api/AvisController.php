<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvisController extends Controller
{
    public function index(Hotel $hotel): JsonResponse
    {
        return response()->json(
            $hotel->avis()->with('user:id,name')->latest('date')->paginate(10)
        );
    }

    public function store(Request $request, Hotel $hotel): JsonResponse
    {
        if ($request->user()->role !== 'client') {
            return response()->json(['message' => 'Seuls les clients peuvent évaluer un hôtel.'], 403);
        }

        $validated = $request->validate([
            'rate' => ['required', 'integer', 'between:1,5'],
            'commentaire' => ['required', 'string', 'max:2000'],
        ]);

        $avis = $hotel->avis()->create([
            'user_id' => $request->user()->id,
            'rate' => $validated['rate'],
            'commentaire' => $validated['commentaire'],
            'date' => now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Votre avis a été publié.',
            'avis' => $avis->load('user:id,name'),
        ], 201);
    }
}
