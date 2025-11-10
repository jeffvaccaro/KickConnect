#!/bin/sh
# Ensure production dependencies are installed on the EC2 instance during deployment.
# This script runs during the predeploy hook and writes detailed logs to /var/log/eb-npm-install.log

set -eux

echo "Starting npm install in /var/app/current" > /var/log/eb-npm-install.log 2>&1
cd /var/app/current

# Use npm ci for reproducible installs. Allow unsafe-perm to avoid permission issues when running as root.
npm ci --production --unsafe-perm --loglevel=info >> /var/log/eb-npm-install.log 2>&1 || {
  echo "npm ci failed, dumping last 200 lines of log" >> /var/log/eb-npm-install.log
  tail -n 200 /var/log/eb-npm-install.log >> /var/log/eb-npm-install.log
  exit 1
}

echo "npm install succeeded" >> /var/log/eb-npm-install.log
exit 0
