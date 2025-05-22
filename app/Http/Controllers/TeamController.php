<?php
namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class TeamController extends Controller
{
    /**
     * Display a listing of the teams.
     */
    public function index(): JsonResponse
    {
        // Retrieve all teams from the database
        $teams = Team::all();
        foreach($teams as $team){
            $team['total'] = $team->employees->count();
        }
        return response()->json([
            'success' => true,
            'data' => $teams
        ], 200);
    }

    public function getTeamOptions(): JsonResponse
    {
        // Retrieve all teams with only id and name fields
        $currentUser = auth()->user();

        if($currentUser->user_type == 'user') {
            $teams = Team::all(['id', 'name']);
        } else {
            $teams = Team::where('id', '!=', '1')->get();
        }

        // Add the total number of employees to each team
        $teams = $teams->map(function ($team) {
            return [
                'id' => $team->id,
                'name' => $team->name,
                'total' => $team->employees()->count(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $teams
        ], 200);
    }

    /**
     * Store a newly created team in the database.
     */
    public function store(Request $request): JsonResponse
    {
        // Validate incoming request
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'max:255',
            'state' => 'max:255',
            'ward' => 'max:255',
            'description' => 'string|max:255',
        ]);

        // If validation fails, return error response
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors(),
                'errors' => $validator->errors()
            ], 400);
        }

        // Create a new team
        try {
            $team = Team::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Team created successfully.',
                'data' => $team
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating team.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified team.
     */
    public function show($id): JsonResponse
    {
        // Find team by ID
        $team = Team::find($id);

        if (!$team) {
            return response()->json([
                'success' => false,
                'message' => 'Team not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $team
        ], 200);
    }

    /**
     * Update the specified team.
     */
    public function update(Request $request, $id): JsonResponse
    {
        // Validate incoming request
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
        ]);

        // If validation fails, return error response
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors(),
                'errors' => $validator->errors()
            ], 400);
        }

        // Find the team to update
        $team = Team::find($id);

        if (!$team) {
            return response()->json([
                'success' => false,
                'message' => 'Team not found.',
            ], 404);
        }

        // Update team data
        try {
            $team->update($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Team updated successfully.',
                'data' => $team
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating team.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified team from storage.
     */
    public function destroy($id): JsonResponse
    {
        // Find team by ID
        $team = Team::find($id);

        if (!$team) {
            return response()->json([
                'success' => false,
                'message' => 'Team not found.',
            ], 404);
        }

        // Delete team
        try {
            $team->delete();
            return response()->json([
                'success' => true,
                'message' => 'Team deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting team.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
