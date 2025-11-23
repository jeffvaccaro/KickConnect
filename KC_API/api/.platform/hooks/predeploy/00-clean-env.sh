#!/usr/bin/env bash
set -euo pipefail

# Ensure no stale environment files remain on the instance that could override EB env vars
cd /var/app/current || exit 0
rm -f .env .env.* || true

echo "Cleaned any local .env files before deploy"
