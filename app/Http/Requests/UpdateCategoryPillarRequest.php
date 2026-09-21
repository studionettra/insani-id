<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateCategoryPillarRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Use the policy method to authorize
        return Gate::allows('updatePillar', $this->route('category'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'is_focus_program' => ['required', 'boolean'],
            'pillar_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:4096'],
            'reality_title' => ['nullable', 'array'],
            'reality_title.id' => ['nullable', 'string', 'max:255'],
            'reality_title.en' => ['nullable', 'string', 'max:255'],
            'reality_title.ar' => ['nullable', 'string', 'max:255'],
            'reality_description' => ['nullable', 'array'],
            'reality_description.id' => ['nullable', 'string'],
            'reality_description.en' => ['nullable', 'string'],
            'reality_description.ar' => ['nullable', 'string'],
            'reality_source' => ['nullable', 'string', 'max:255'],
            'video_url' => ['nullable', 'string', 'max:500'],
            'stats_metrics' => ['nullable'],
            'gallery_images' => ['nullable', 'array'],
            'gallery_images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
            'existing_gallery' => ['nullable', 'array'],
            'existing_gallery.*' => ['string'],
        ];
    }
}
