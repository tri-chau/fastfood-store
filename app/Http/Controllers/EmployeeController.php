<?php
namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    public function store(Request $request)
    {
        // Validate the incoming request data
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'phone_number' => 'required|string|unique:users,phone_number',
            'date_of_birth' => 'required|date',
            'date_registered' => 'required|date',
            'gender' => 'required|in:Male,Female',
            'team_id' => 'required|exists:teams,id',
            'role_id' => 'required|exists:roles,id',
            'level' => 'required|in:Manager,Receptionist,Waiter',
        ]);

        // If validation fails, return the error response
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Prepare data to create the user
        $userData = [
            'name' => $request->input('full_name'),
            'email' => $request->input('email'),
            'phone_number' => $request->input('phone_number'),
            'date_of_birth' => $request->input('date_of_birth'),
            'gender' => $request->input('gender'),
            'password' => Hash::make('123456'), // Random password or handle it as needed
            'user_type' => 'user', // Specify user type as 'user'
            'team_id' => $request->input('team_id'), // Specify user type as 'user'
        ];

        try {
            // Start transaction to ensure both operations succeed or fail together
            DB::beginTransaction();

            // Create the User first
            $user = User::create($userData);
            $role = Role::find($request->input('role_id'));
            // Assign a role to the user
            $user->assignRole($role->name); // Modify role as per your requirement

            // Now create the Employee and associate it with the created User
            $employee = Employee::create([
                'user_id' => $user->id,
                'team_id' => $request->input('team_id'),
                'full_name' => $request->input('full_name'),
                'email' => $request->input('email'),
                'phone_number' => $request->input('phone_number'),
                'date_of_birth' => $request->input('date_of_birth'),
                'date_registered' => $request->input('date_registered'),
                'gender' => $request->input('gender'),
                'level' => $request->input('level'),
            ]);

            // Commit transaction if both operations succeed
            DB::commit();

            return response()->json([
                'message' => 'Employee and User created successfully.',
                'data' => [
                    'employee' => $employee,
                    'user' => $user
                ]
            ], 201);
        } catch (\Exception $e) {
            // Rollback transaction if an error occurs
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function index()
    {
        try {
            // Fetch all employees with related user and team data
            $employees = Employee::with(['team'])->get();

            return response()->json([
                'message' => 'Employees retrieved successfully.',
                'data' => $employees,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function show($id)
    {
        try {
            // Fetch employee with related user and team data
            $employee = Employee::with(['user', 'team'])->find($id);

            if (!$employee) {
                return response()->json([
                    'error' => 'Employee not found.',
                ], 404);
            }

            return response()->json([
                'message' => 'Employee details retrieved successfully.',
                'data' => $employee,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

}
