<?php

namespace App\Http\Controllers;

use App\Models\UserModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function getMember(){
        $member = UserModel::where('role', 'MEMBER')->get();
        return response()->json([
            'success' => true,
            'statusCode' => '200',
            'message' => 'Data GET Successfully',
            'payload' => $member
        ]);
    }

    public function getAdmin(){
        $admin = UserModel::where('role', 'ADMIN');
        return response()->json([
            'success' => true,
            'statusCode' => '200',
            'message' => 'Data GET Successfully',
            'payload' => $admin
        ]);
    }

    public function store(Request $request){
        $validated = $request->validate([
            'username'  => 'required|string|max:100|unique:users,username',
            'password' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:users,email',
            'name' => 'required|string|max:100',
            'phone_number' => 'nullable|string|max:15|regex:/^([0-9\\s\\-\\+\\(\\)]*)$/|min:10',
            'citizen_id' => 'nullable|string|max:20',
            'role' => 'nullable|in:ADMIN,MEMBER'
        ]);

        // Prevent public creation of ADMIN accounts - default to MEMBER
        $role = isset($validated['role']) && $validated['role'] === 'ADMIN' ? 'MEMBER' : ($validated['role'] ?? 'MEMBER');

        $userData = [
            'username' => $validated['username'],
            'password' => bcrypt($validated['password']),
            'email' => $validated['email'],
            'name' => $validated['name'],
            'phone_number' => $validated['phone_number'] ?? null,
            'citizen_id' => $validated['citizen_id'] ?? null,
            'role' => $role,
        ];

        $user = UserModel::create($userData);

        // create token with appropriate ability
        $ability = $user->role === 'ADMIN' ? ['admin'] : ['member'];
        $token = $user->createToken('api-token', $ability)->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    // Register wrapper (alias to store)
    public function register(Request $request)
    {
        return $this->store($request);
    }

    // Login: return Sanctum token
    public function login(Request $request)
    {
        $validated = $request->validate([
            'login' => 'required|string', // can be username or email
            'password' => 'required|string'
        ]);

        $login = $validated['login'];

        $user = UserModel::where('username', $login)->orWhere('email', $login)->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $abilities = $user->role === 'ADMIN' ? ['admin'] : ['member'];
        $token = $user->createToken('api-token', $abilities)->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 200);
    }

    // Logout: revoke current token
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            // Revoke current access token
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logged out'
        ]);
    }

    public function show($id){
        $user = UserModel::find($id);
        if(!$user){
            return response()->json([
                'message' => 'User Not Found'
            ], 404);
        }
        return response()->json($user, 200);
    }

    public function update(Request $request, $id){
        $user = UserModel::find($id);
        if(!$user){
            return response()->json([
                'statusCode' => '404',
                'success' => false,
                'message' => 'User Not Found',
            ], 404);
        }

        $validated = $request->validate([
            'username'  => 'required|string|max:100|unique:users,username,'.$id,
            'password' => 'nullable|string|max:100',
            'email' => 'required|string|email|max:100|unique:users,email,'.$id,
            'name' => 'required|string|max:100',
            'phone_number' => 'nullable|string|max:15|regex:/^([0-9\s\-\+\(\)]*)$/|min:10',
            'citizen_id' => 'nullable|string|max:20',
            'role' => 'required|in:ADMIN,MEMBER'
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }
        $user->update($validated);
        return response()->json([
            'statusCode' => '200',
            'success' => true,
            'message' => 'Data Update Successfully',
            'payload' => $user
        ], 200);
    }

    public function destroy($id){
        $user = UserModel::find($id);
        if(!$user){
            return response()->json([
                'statusCode' => '404',
                'success' => false,
                'message' => 'User Not Found'
            ],404);
        }

        $user->delete();
        return response()->json([
            'statusCode' => '200',
            'success' => true,
            'message' => 'User Delete Successfully',
            'payload' => $user
        ]);

    }

}
