<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // Max 10MB input
        ]);

        $file = $request->file('image');
        
        // Generate a unique filename
        $filename = uniqid('rich_text_') . '_' . time() . '.webp';
        
        // Use Intervention Image to resize and convert to webp
        $manager = new ImageManager(new Driver());
        $image = $manager->read($file);
        
        // Resize image if width is greater than 800px, keeping aspect ratio
        if ($image->width() > 800) {
            $image->scale(width: 800);
        }
        
        // Encode to webp format with 80% quality
        $encodedImage = $image->toWebp(80);
        
        // Save to storage
        $path = 'public/uploads/rich-text/' . $filename;
        Storage::put($path, (string) $encodedImage);
        
        // Return URL
        return response()->json([
            'url' => Storage::url('uploads/rich-text/' . $filename)
        ]);
    }
}
