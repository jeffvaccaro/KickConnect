# kickConnect

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.7.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Deploy

This project includes a small PowerShell-based deploy helper that builds the production bundles and uploads the `dist/` output to S3, with an optional CloudFront invalidation.

Quick steps (from the repository root):

1. Ensure the AWS CLI is installed and you have a deploy profile configured. The default profile used by the scripts is `kickconnect-deployer`.

```powershell
# configure the deploy profile (run only once)
aws configure --profile kickconnect-deployer
```

2. Run the production deploy (build + upload to S3):

```powershell
cd .\KC_UI
npm run deploy:prod
```

Notes and options

- The `deploy:prod` script runs `ng build --configuration production` then calls the PowerShell script at `scripts/deploy-ui.ps1` which syncs `dist/<project>/` to the S3 bucket `kickconnect-angular` by default.
- The deploy script now creates a CloudFront invalidation by default. The default CloudFront distribution id is configured in the script (`E3OR1QVCCECPVP`).

```powershell
# Build, deploy, and invalidate CloudFront (default behaviour)
cd .\KC_UI
npm run deploy:prod
```

Important: where files land in S3

- The CloudFront distribution for this site is configured with an OriginPath of `/browser`, so the distribution expects your site files to live under the `browser/` prefix in the bucket (for example `s3://kickconnect-angular/browser/index.html`).
- The deploy helper `scripts/deploy-ui.ps1` has been updated to detect and avoid double-nesting (for example `browser/browser/...`). It will automatically sync the correct build *contents* into `s3://<bucket>/browser/` for you.
- Avoid running ad-hoc `aws s3 sync` commands that target `s3://kickconnect-angular/browser/` from a parent folder that itself contains a `browser/` folder — that creates `browser/browser/...`. If you must run `aws s3 sync` manually, sync from the build output folder contents (trailing slash) like shown below.

If you prefer to run the AWS CLI directly, sync the contents of the Angular build into the `browser/` prefix like this (note the trailing slash on the source path — that uploads the contents, not the folder):

```powershell
# from the repository root
$profile = "kickconnect-deployer"
aws s3 sync ".\KC_UI\dist\kickConnect\" "s3://kickconnect-angular/browser/" --profile $profile --delete
```

- If you already have a built `dist/` directory and want to force the script to rebuild, remove the `dist/` folder or run the build command first. The script skips rebuilding when it finds an existing `dist` folder.
- If the script reports "The config profile (kickconnect-deployer) could not be found", run the `aws configure --profile kickconnect-deployer` command above or pass `-Profile <your-profile>` to `deploy-ui.ps1`.
- Required AWS permissions for the deploy profile: S3 PutObject/DeleteObject on the target bucket and (optionally) `cloudfront:CreateInvalidation` to create invalidations.

If you'd like, I can add a small GitHub Actions workflow next that runs the same `deploy-ui.ps1` on push to `main` (requires storing AWS credentials in repository secrets).

## Production deployment (UI upload + API package)

These exact steps perform a production UI deploy (build, upload to S3 under the `browser/` prefix, and create a CloudFront invalidation) and then create a 7‑Zip package of the API code you can upload manually to Elastic Beanstalk.

Prerequisites
- AWS CLI v2 configured with a deploy-capable profile (default used below: `kickconnect-deployer`).
- 7‑Zip installed and `7z`/`7z.exe` available on PATH (required by the API packaging script).
- If you plan to use the EB CLI (`eb deploy`) have it initialized for the API app/environment.

Step 1 — Build & deploy the Angular UI (uploads and invalidates CloudFront)
```powershell
# from repository root
cd .\KC_UI
# this builds the production bundle, syncs the build contents into s3://kickconnect-angular/browser/ and creates a CloudFront invalidation
npm run deploy:prod
```

Step 2 — Package the Express API as a 7‑Zip archive (ready for manual upload)
```powershell
# from repository root
cd .\KC_API\api

# install dependencies (recommended before packaging)
npm ci

# create a 7-Zip EB package; the script places the archive into the repository-level Deploy/ folder
npm run package:eb

# Verify the created archive (newest by modification time)
Get-ChildItem .\Deploy\*.zip | Sort-Object LastWriteTime -Descending | Select-Object -First 1
```

Step 3 — Upload the API package manually (two options)
- Manual Console: open the Elastic Beanstalk console, Application → Upload and deploy, choose the zip created in `Deploy/` and deploy to your environment.
- AWS CLI (optional): upload to an S3 location and create an application version, then update the environment. Replace placeholders (`<YourEBBucket>`, `<AppName>`, `<EnvName>`) accordingly.

```powershell
$profile = "kickconnect-deployer"
$zip = Get-ChildItem .\Deploy\*.zip | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$zipName = $zip.Name
$ebBucket = "<YourEBBucket>"   # replace with the S3 bucket you use for EB application versions

# upload zip
aws s3 cp $zip.FullName "s3://$ebBucket/$zipName" --profile $profile

# create application version
$label = ("v{0:yyyyMMdd-HHmm}" -f (Get-Date))
$appName = "<AppName>"
aws elasticbeanstalk create-application-version --application-name $appName --version-label $label --source-bundle S3Bucket=$ebBucket,S3Key=$zipName --profile $profile

# update environment
$envName = "<EnvName>"
aws elasticbeanstalk update-environment --environment-name $envName --version-label $label --profile $profile
```

Notes
- The UI deploy script automatically uploads into the `browser/` prefix (CloudFront OriginPath) and invalidates CloudFront so users see the new UI quickly.
- The API package created by `npm run package:eb` contains the `.platform/hooks/predeploy/01-install-deps.sh` hook that will run `npm ci` on the instance during deploy if you choose to deploy via EB directly from that archive.
- If you prefer a single script that runs both steps automatically, I can add a `deploy-all.ps1` at the repo root that runs the UI deploy then packages the API and optionally calls `eb deploy` or the AWS CLI flow.