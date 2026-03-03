# Video Calls Feature

## What We Built

We use Agora token-based video call flow for appointments and sessions.

## Main Actions

- Generate secure call token
- Join appointment call
- Join session call
- Restrict access to authorized users only

## Routes and APIs

- Pages: `/shared/call/[appointmentId]`, `/shared/call/session/[sessionId]`
- API: `/api/agora/token`

## Notes

If users see token errors, we check `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` first.
