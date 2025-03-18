<?php
// app/Http/Controllers/ImageController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageController extends Controller
{
    public function upload(Request $request)
    {
        // Validate the image file
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Generate a unique file name
        $imageName = Str::random(40) . '.' . $request->image->extension();

        // Store the image in the 'public_fail' disk (which stores files in storage_fail/app/public_fail)
        $path = $request->file('image')->storeAs('images', $imageName, 'public_fail');

        // Optionally, you can save the image path in the database if needed
        // Image::create(['path' => $path]);

        return response()->json(['message' => 'Image uploaded successfully!', 'image_path' => Storage::url($path)], 200);
    }
    public function getImage($imageName)
    {
        // Define the storage_fail disk (public_fail disk is used here)
        $disk = 'public_fail';

        // Construct the path where the image is stored
        $path = 'images/' . $imageName;

        // Check if the file exists
        if (!Storage::disk($disk)->exists($path)) {
            return response()->json(['error' => 'Image not found'], 404);
        }

        // Get the file content from storage_fail
        $file = Storage::disk($disk)->get($path);

        // Return the image content as a response
        return response($file, 200)
            ->header('Content-Type', Storage::disk($disk)->mimeType($path));
    }
}
