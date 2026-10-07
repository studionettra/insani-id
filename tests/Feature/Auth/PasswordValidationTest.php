<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

test('password defaults reject leaked passwords using HaveIBeenPwned API', function () {
    // SHA-1 of "Password123!" is 4E622B7A95FA5FF61BF0CA79DE87BC1FA7198160
    // Prefix: 4E622, Suffix: B7A95FA5FF61BF0CA79DE87BC1FA7198160
    Http::fake([
        'api.pwnedpasswords.com/range/4E622' => Http::response("B7A95FA5FF61BF0CA79DE87BC1FA7198160:34912\n"),
    ]);

    $validator = Validator::make([
        'password' => 'Password123!',
    ], [
        'password' => ['required', Password::defaults()],
    ]);

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->first('password'))
        ->toContain('bocor');
});

test('password defaults accept uncompromised passwords', function () {
    Http::fake([
        'api.pwnedpasswords.com/*' => Http::response(''),
    ]);

    $validator = Validator::make([
        'password' => 'VeryUniqueAndSecureP@ss2026!',
    ], [
        'password' => ['required', Password::defaults()],
    ]);

    expect($validator->passes())->toBeTrue();
});
