#!/usr/bin/env bash
# End-to-end smoke test of every auth endpoint your frontend calls.
# Run with:  bash test-auth-e2e.sh
# Requires:  backend up on http://localhost:3000 with Postgres reachable.
#
# Each step prints the HTTP code + body so you can see exactly what the
# frontend would receive.

set -u
BASE="${API_BASE:-http://localhost:3000}"
EMAIL="e2e+$(date +%s)@example.com"
PASSWORD="TestPass123"
COOKIE_JAR="$(mktemp)"
trap "rm -f $COOKIE_JAR" EXIT

req() {
  local label="$1"; shift
  echo
  echo "── $label ──"
  curl -s -w "\nHTTP %{http_code}\n" -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$@"
}

echo "Email used: $EMAIL"

req "1. /health (sanity)" "$BASE/health"

req "2. POST /auth/register" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"displayName\":\"E2E\"}"

# Capture access token from the register response for /me + /logout.
REG_RES=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"reg2+$(date +%s)@example.com\",\"password\":\"$PASSWORD\",\"displayName\":\"E2E2\"}")
ACCESS=$(echo "$REG_RES" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
echo
echo "Captured access token: ${ACCESS:0:30}..."

req "3. GET /auth/me (uses access token)" "$BASE/auth/me" \
  -H "Authorization: Bearer $ACCESS"

req "4. POST /auth/refresh (uses cookie)" -X POST "$BASE/auth/refresh"

req "5. POST /auth/login (existing user)" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

req "6. POST /auth/login WRONG password (expect 401)" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"WrongPass1\"}"

req "7. POST /auth/forgot-password" -X POST "$BASE/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}"

req "8. POST /auth/reset-password (invalid token, expect 400)" -X POST "$BASE/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"fake-token\",\"password\":\"NewPass123\"}"

req "9. GET /auth/verify-email (invalid token, expect 400)" \
  "$BASE/auth/verify-email?token=fake"

req "10. POST /auth/resend-verification (with token)" -X POST "$BASE/auth/resend-verification" \
  -H "Authorization: Bearer $ACCESS" \
  -H "Content-Type: application/json" -d '{}'

req "11. POST /auth/google (fake idToken, expect 400/401)" -X POST "$BASE/auth/google" \
  -H "Content-Type: application/json" \
  -d '{"idToken":"not-a-real-google-token"}'

req "12. POST /auth/logout (with token)" -X POST "$BASE/auth/logout" \
  -H "Authorization: Bearer $ACCESS"

echo
echo "── Done. Expected: every step ≠ 500. ──"
