<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index()
    {
        $categories = Category::withTrashed()->get(); // Include soft-deleted records
    }

    public function getCategories()
    {
        // Retrieve all teams with only id and name fields
        $categories = Category::where('show_for_customer', 1)->get(['id', 'name', 'description', 'type', 'priority', 'image_path']);

        // Add the total number of employees to each team
        $categories->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
                'type' => $category->type,
                'priority' => $category->priority,
                'image_path' => $category->image_path,
            ];
        });

        return $categories;
    }
    public function getCategoryJson(): JsonResponse
    {
        $categories = $this->getCategories();

        return response()->json([
            'success' => true,
            'data' => $categories
        ], 200);
    }
    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:Food,Drink,Topping',
        ]);

        Category::create($validated);

        $category = $this->getCategories();

        return response()->json(['message' => 'Category created successfully.', 'data' => $category], 201);
    }

    /**
     * Display the specified category.
     */
    public function show(string $id)
    {
        $category = Category::findOrFail($id);

        return response()->json($category);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|in:Food,Drink,Topping',
            'team_id' => 'nullable|uuid|exists:teams,id',
        ]);

        $category = Category::findOrFail($id);
        $category->update($validated);

        return response()->json(['message' => 'Category updated successfully.', 'data' => $category]);
    }

    /**
     * Remove the specified category from storage (soft delete).
     */
    public function destroy(string $id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully.']);
    }

    /**
     * Restore a soft-deleted category.
     */
    public function restore(string $id)
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->restore();

        return response()->json(['message' => 'Category restored successfully.']);
    }

    /**
     * Permanently delete a soft-deleted category.
     */
    public function forceDelete(string $id)
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->forceDelete();

        return response()->json(['message' => 'Category permanently deleted.']);
    }

    public function adminGetCategories(): JsonResponse
    {
        $categories = Category::all();

        return response()->json([
            'success' => true,
            'data' => $categories
        ], 200);
    }
}
