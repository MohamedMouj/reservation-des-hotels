<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
class AuthController extends Controller
{
    //
    function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!Auth::validate($credentials)) {
            return response()->json(['message' => 'Email ou mot de passe incorrect.'], 401);
        }

        $user = User::where('email', $credentials['email'])->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->only('id', 'name', 'email', 'telephone', 'role'),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
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
            'telephone' => 'nullable|string|max:32',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'telephone' => $request->telephone,
        ]);
        $user->refresh();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->only('id', 'name', 'email', 'telephone', 'role'),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }
}
