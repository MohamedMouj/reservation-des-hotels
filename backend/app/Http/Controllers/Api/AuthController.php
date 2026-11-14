<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
class AuthController extends Controller
{
    //
    function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (auth()->attempt($credentials)) {
            $user = auth()->user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user->only('id', 'name', 'email', 'role'),
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        }

        return response()->json(['message' => 'Unauthorized'], 401);
    }

    function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->only('id', 'name', 'email', 'role'),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }
}
