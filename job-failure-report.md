# CI Job Failure Report

## Summary

The GitHub Actions job failed because Laravel could not find the Vite build manifest at:

`/home/runner/work/insani-id/insani-id/public/build/manifest.json`

The log shows the following exception:

```text
Illuminate\Foundation\ViteManifestNotFoundException: Vite manifest not found at: /home/runner/work/insani-id/insani-id/public/build/manifest.json in /home/runner/work/insani-id/insani-id/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:974
```

This caused the application to return HTTP 500 for many requests instead of the expected 200/403/404 responses. The job ended with:

- 201 failed
- 1 passed
- exit code 1

## Root cause

This is a build artifact problem, not a normal authorization or business-logic failure.

Laravel + Vite expects a generated file at `public/build/manifest.json`. That file is usually created by a frontend build step such as:

```bash
npm install
npm run build
```

If that step is skipped or fails in CI, the manifest file does not exist and Laravel throws `ViteManifestNotFoundException` when rendering pages or Inertia responses that reference frontend assets.

## Evidence from the logs

The job logs show repeated failures like:

```text
Expected response status code [200] but received 500.
Expected response status code [403] but received 500.
Expected response status code [404] but received 500.
```

This pattern appears across many feature tests, including:

- `Tests\Feature\Security\DonationProofSecurityTest`
- `Tests\Feature\Security\KycDocumentSecurityTest`
- `Tests\Feature\Security\ProgramAuthorizationAndCmsSanitizationSecurityTest`
- `Tests\Feature\Security\ProgramReportEvidenceSecurityTest`
- `Tests\Feature\Security\SiteSettingsAndLinkSecurityTest`
- `Tests\Feature\SeoAndSitemapTest`
- `Tests\Feature\Settings\ProfileUpdateTest`
- `Tests\Feature\Settings\SecurityTest`

The repeated error is the same one in every case:

```text
Illuminate\Foundation\ViteManifestNotFoundException: Vite manifest not found at: /home/runner/work/insani-id/insani-id/public/build/manifest.json
```

## Why this caused the test suite to fail

Once the manifest is missing, Laravel cannot resolve the built frontend assets. Pages that render asset tags or Inertia responses fail during request handling, so the app returns a 500 before the expected controller logic can finish. That is why tests expecting 200/403/404 all fail with 500.

## Recommended fix

Ensure the CI workflow performs the frontend build before running tests. For example:

```yaml
- name: Install dependencies
  run: npm ci

- name: Build assets
  run: npm run build

- name: Run tests
  run: php artisan test
```

Also verify that the built files are actually written to:

```text
public/build/manifest.json
```

and that the repo is not accidentally ignoring the generated build output.

## Conclusion

The job failed because the Vite manifest was missing in CI. The app crashed with `ViteManifestNotFoundException`, and the test suite then reported many unexpected 500 responses. The fix is to generate the frontend assets before the test suite runs.

## Link

- GitHub Actions run: https://github.com/studionettra/insani-id/actions/runs/42537757324/job/128905750102
