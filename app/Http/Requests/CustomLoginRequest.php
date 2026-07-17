<?php

namespace App\Http\Requests;

use Laravel\Fortify\Http\Requests\LoginRequest;
use App\Rules\TurnstileRule;

class CustomLoginRequest extends LoginRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['cf-turnstile-response'] = ['required', 'string', new TurnstileRule];
        return $rules;
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'cf-turnstile-response.required' => 'Mohon selesaikan verifikasi keamanan (Captcha).',
        ];
    }
}
