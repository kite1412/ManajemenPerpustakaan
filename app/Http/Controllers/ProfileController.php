<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Show the form for editing the user's profile.
     */
    public function edit(Request $request)
    {
        return Inertia::render('Profile/Edit', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', "unique:users,email,{$user->id}"],
            'username' => ['required', 'string', 'max:100', "unique:users,username,{$user->id}"],
            'phone_number' => ['nullable', 'string', 'max:15'],
            'citizen_id' => ['nullable', 'string', 'max:20'],
            'role' => ['nullable', 'in:ADMIN,MEMBER'],
        ]);

        // Only admins may update roles
        if (! $user->isAdmin() && isset($validated['role'])) {
            unset($validated['role']);
        }

        $user->update($validated);

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        // Delete user
        $user->delete();

        return Redirect::to('/');
    }
}
