<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Mail\WelcomeMail;
use App\Mail\ResetPasswordMail;

class AuthController extends Controller
{
    // ── Login ─────────────────────────────────────────────────────────────────
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'        => 'required|email',
            'mot_de_passe' => 'required'
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->mot_de_passe, $user->makeVisible('mot_de_passe')->mot_de_passe)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user
        ]);
    }

    // ── Register ──────────────────────────────────────────────────────────────
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'nom'          => 'required|string',
            'prenom'       => 'required|string',
            'email'        => 'required|email|unique:utilisateur,email',
            'mot_de_passe' => 'required|min:6',
            'telephone'    => 'nullable|string',
            'id_role'      => 'required|exists:role,id_role'
        ]);

        $user = Utilisateur::create([
            'nom'               => $request->nom,
            'prenom'            => $request->prenom,
            'email'             => $request->email,
            'mot_de_passe'      => Hash::make($request->mot_de_passe),
            'telephone'         => $request->telephone,
            'id_role'           => $request->id_role,
            'date_inscription'  => now()
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        try {
            Mail::to($user->email)->send(new WelcomeMail($user));
        } catch (\Exception $e) {
            // Ne pas bloquer l'inscription si email échoue
        }

        return response()->json([
            'token' => $token,
            'user'  => $user
        ], 201);
    }

    // ── Logout ────────────────────────────────────────────────────────────────
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté']);
    }

    // ── Check Email ───────────────────────────────────────────────────────────
    public function checkEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Aucun compte associé à cet email.'
            ], 404);
        }

        return response()->json([
            'message' => 'Email trouvé.',
            'user'    => [
                'prenom' => $user->prenom,
                'nom'    => $user->nom,
            ]
        ]);
    }

    // ── Forgot Password — envoie email avec lien ──────────────────────────────
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:utilisateur,email',
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        // Générer token unique
        $token = Str::random(64);

        // Supprimer ancien token si existe
        DB::table('password_reset_tokens')
          ->where('email', $request->email)
          ->delete();

        // Stocker nouveau token
        DB::table('password_reset_tokens')->insert([
            'email'      => $request->email,
            'token'      => $token,
            'created_at' => now(),
        ]);

        // Lien vers frontend
        $lien = "http://localhost:5173/reset-password?token={$token}&email=" . urlencode($request->email);

        // Envoyer email
        try {
            Mail::to($user->email)->send(
                new ResetPasswordMail($user, $lien)
            );
        } catch (\Exception $e) {
            // silencieux
        }

        return response()->json([
            'message' => 'Un email de réinitialisation a été envoyé.'
        ]);
    }

    // ── Reset Password Token — change le mot de passe ─────────────────────────
    public function resetPasswordToken(Request $request): JsonResponse
    {
        $request->validate([
            'token'        => 'required|string',
            'mot_de_passe' => 'required|min:6',
            'confirmation' => 'required|same:mot_de_passe',
        ]);

        // Vérifier token
        $record = DB::table('password_reset_tokens')
                    ->where('token', $request->token)
                    ->first();

        if (!$record) {
            return response()->json([
                'message' => 'Token invalide ou expiré.'
            ], 400);
        }

        // Vérifier expiration 60 minutes
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')
              ->where('token', $request->token)
              ->delete();
            return response()->json([
                'message' => 'Le lien a expiré. Veuillez refaire la demande.'
            ], 400);
        }

        // Mettre à jour mot de passe
        $user = Utilisateur::where('email', $record->email)->first();
        $user->mot_de_passe = Hash::make($request->mot_de_passe);
        $user->save();

        // Supprimer token utilisé
        DB::table('password_reset_tokens')
          ->where('token', $request->token)
          ->delete();

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.'
        ]);
    }

    // ── Reset Password (ancien flow direct) ───────────────────────────────────
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'        => 'required|email|exists:utilisateur,email',
            'mot_de_passe' => 'required|min:6',
            'confirmation' => 'required|same:mot_de_passe',
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        $user->mot_de_passe = Hash::make($request->mot_de_passe);
        $user->save();

        try {
            Mail::to($user->email)->send(
                new ResetPasswordMail($user, $request->mot_de_passe)
            );
        } catch (\Exception $e) {
            // silencieux
        }

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.'
        ]);
    }
}