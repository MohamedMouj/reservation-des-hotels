<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Hotel;
use Illuminate\Database\QueryException;

class HotelController extends Controller
{
    //
    public function index()
    {
        $hotels = Hotel::with('chambres')->withCount('avis')->get();
        
        return response()->json($hotels, 200);
    }

    public function getHotelById($id)
    {
        $hotel = Hotel::with('chambres')->withCount('avis')->findOrFail($id);
        return response()->json($hotel, 200);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nom' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'ville' => 'required|string|max:255',
            'description' => 'required|string',
        ]);
        $hotel = Hotel::create($validatedData);
        return response()->json($hotel, 201);
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string|max:255',
            'ville' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
        ]);

        $hotel = Hotel::findOrFail($id);
        $hotel->update($validatedData);

        return response()->json($hotel, 200);
    }

    public function destroy($id)
    {
        $hotel = Hotel::findOrFail($id);

        try {
            $hotel->delete();
        } catch (QueryException) {
            return response()->json([
                'message' => 'Cet hôtel ne peut pas être supprimé car il possède des réservations ou des avis associés.',
            ], 409);
        }

        return response()->json(null, 204);
    }
}
