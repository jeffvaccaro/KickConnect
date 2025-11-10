# Deploying KickConnect (UI + API)

This document explains how to run the combined local deploy/packaging helper `scripts/deploy-all.ps1` and the related packaging/deploy scripts so you can reproduce UI uploads and create Elastic Beanstalk API bundles in the future.

TL;DR
- From the repository root run a dry-run first to confirm what will happen:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/deploy-all.ps1" -DryRun
```

- To perform the real steps (UI deploy + package API):

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/deploy-all.ps1"
```

If you only want to create the API zip without touching the UI, run:

```powershell
cd KC_API\api
npm ci
npm run package:eb
```

What `deploy-all.ps1` does
- UI: runs `npm run deploy:prod` inside `KC_UI` — this builds the Angular app, syncs the `dist/` output into the configured S3 bucket (under the `browser/` prefix) and invalidates the CloudFront distribution by default.
- API: runs `npm ci` then `npm run package:eb` inside `KC_API/api`, which uses the repo `scripts/package-api.ps1` packer to create a 7‑Zip archive (zip) placed into `Deploy/`.
- The script intentionally does NOT call `eb deploy`; it leaves the created ZIP ready for manual upload to Elastic Beanstalk (user preference).

Options and examples
- `-DryRun` — print the commands the script would run and do not execute them. Always start with a dry run when you want to preview.
- `-AwsProfile <name>` — specify the AWS CLI profile name to use. Default: `kickconnect-deployer`.
- `-SkipUI` — skip the UI deploy step.
- `-SkipAPI` — skip the API packaging step.

Examples

Dry run with a different profile:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/deploy-all.ps1" -DryRun -AwsProfile my-admin-profile
```

Only package the API (no UI):

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/deploy-all.ps1" -SkipUI
```

Prerequisites (local machine)
- Windows PowerShell v5.1 or PowerShell Core. The script will run in `powershell.exe` if `pwsh` isn't available.
- Node.js & npm (the project uses npm scripts). Ensure `node` and `npm` are in PATH.
- AWS CLI configured with a profile that has S3 and CloudFront permissions (for UI deploy) and, if you want to use CLI to upload the EB zip later, the ability to create application versions / update environments.
- 7‑Zip (`7z.exe`) must be on PATH for the packer scripts to create the archive.

Where artifacts appear
- UI files are uploaded to the configured S3 bucket (configured inside `scripts/deploy-ui.ps1` or `KC_UI/package.json` deploy script). The CloudFront distribution is invalidated when `-Invalidate` or the default `deploy:prod` behavior runs.
- API bundle: a zip file (7‑Zip) is created under `Deploy/` with a name like `KC-EB-Deploy-FULL-<N>.zip`.

Notes and troubleshooting
- If you see errors about `pwsh` not being found, run the script with `powershell.exe` (example above) or install PowerShell Core.
- If the packaging step fails because files are locked (Windows EBUSY), close editors that may have the zip open or use Sysinternals Handle to find the locker.
- The script prints the most-recent zip found in `Deploy/` even in `-DryRun` mode; this is just the latest existing archive and not a new one.
- `deploy-all.ps1` does not run `eb deploy` — upload the generated zip manually to the Elastic Beanstalk console or use the AWS CLI if you have the permissions.

Minimal package
- To create a minimal EB package (whitelist):

```powershell
cd KC_API\api
npm run package:eb:minimal
```

Manual Elastic Beanstalk upload (example using AWS CLI)

```powershell
# Create an S3 object for the app version (replace bucket/application/version)
aws s3 cp .\Deploy\KC-EB-Deploy-FULL-4.zip s3://your-eb-bucket/path/KC-EB-Deploy-FULL-4.zip --profile kickconnect-deployer

# Create an application version
aws elasticbeanstalk create-application-version --application-name KickConnectApi --version-label v20251109-1 --source-bundle S3Bucket="your-eb-bucket",S3Key="path/KC-EB-Deploy-FULL-4.zip" --profile kickconnect-deployer

# Update environment to use the new version
aws elasticbeanstalk update-environment --environment-name KickConnectApi-env --version-label v20251109-1 --profile kickconnect-deployer
```

If you'd like, I can add a small helper that uploads the created zip and creates an application version for you — but I left that out intentionally because the deploy account currently has limited permissions and you preferred manual EB uploads.

If anything here is unclear or you want this copied into a different file (`KC_UI/README.md` or `Deploy/README.md`), tell me where and I will move it.

---
Last updated: 2025-11-09
Deploying KickConnect UI and API

This repository includes helper scripts to build and deploy the Angular UI to S3 + CloudFront and to package the Express API for Elastic Beanstalk.

Quick pointers

- UI build & deploy (recommended):
  - From the `KC_UI` folder: `npm run deploy:prod` (this runs `build:prod` then `deploy`).
  - Or, from the repo root (PowerShell):
    - `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy-ui.ps1 -AwsProfile kickconnect-deployer -Bucket kickconnect-angular -Region us-west-2 -Invalidate`

- One-command UI upload + API package:
  - `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-and-deploy.ps1 -AwsProfile kickconnect-deployer -Bucket kickconnect-angular -Region us-west-2 -Invalidate`

Defaults used by the scripts

- AWS profile: kickconnect-deployer
- Region: us-west-2
- S3 bucket: kickconnect-angular
- CloudFront distribution ID (used for invalidation): E3OR1QVCCECPVP

Important files

- `KC_UI/package.json` — contains `build:prod`, `deploy`, and `deploy:prod` npm scripts that call the PowerShell helper.
- `scripts/deploy-ui.ps1` — builds and uploads the UI; supports CloudFront invalidation.
- `scripts/build-and-deploy.ps1` — builds the UI, uploads it, optionally creates a CloudFront invalidation, and packages the API into a 7-Zip archive under `Deploy/`.

Notes

- The PowerShell scripts expect the AWS CLI to be configured with the named profile used for the deploy: `aws configure --profile kickconnect-deployer`.
- On Windows the npm scripts call the `powershell` executable. If you use PowerShell Core (`pwsh`) adjust as needed.
- `Deploy/` and its zip artifacts are ignored by `.gitignore`.

If you want, I can also add a small root-level npm script that wraps the `build-and-deploy.ps1` call for convenience. Let me know if you'd like that and which name you prefer (for example: `deploy:all`).
