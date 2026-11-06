<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Hotel;

class HotelController extends Controller
{
    //
    public function index()
    {
        // Fetch all hotels along with their attached chambres
        $hotels = Hotel::with('chambres')->get();
        
        return response()->json($hotels, 200);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nom' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'ville' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $hotel = Hotel::create($validatedData);
        return response()->json($hotel, 201);
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'nom' => 'string|max:255',
            'address' => 'string|max:255',
            'ville' => 'string|max:255',
            'pays' => 'string|max:255',
            'description' => 'nullable|string',
        ]);

        $hotel = Hotel::findOrFail($id);
        $hotel->update($validatedData);

        return response()->json($hotel, 200);
    }

    public function destroy($id)
    {
        $hotel = Hotel::findOrFail($id);
        $hotel->delete();

        return response()->json(null, 204);
    }
}
