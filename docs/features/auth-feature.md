# Auth Feature

## What We Built

We built account login/signup with role support and secure sessions.

## Main Flows

- Email + password signup
- Email verification
- Forgot password and reset password
- Google OAuth login

## Routes and APIs

- Pages: `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`
- APIs: `/api/auth/*`

## Notes

We block unverified users from full access until email is verified.
