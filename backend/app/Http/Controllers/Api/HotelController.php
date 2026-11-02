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
}
