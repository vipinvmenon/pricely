#!/usr/bin/env bash
set -euo pipefail

pkill -f "next-server" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "npm run start" 2>/dev/null || true
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "playwright" 2>/dev/null || true
pkill -f "Chromium" 2>/dev/null || true

echo "Stopped local Pricely app, scraper, and browser worker processes."
