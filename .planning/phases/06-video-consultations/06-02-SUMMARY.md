# Phase 6 Plan 2: Video Call UI Summary

**Core 1:1 video call component and call route created**

## Accomplishments

- Built `VideoCall` client component with Agora join/publish flow
- Added remote participant handling and basic call controls (mic/camera/leave)
- Added shared call page route with auth + appointment membership checks

## Files Created

- `src/components/video/VideoCall.tsx` - Agora client integration + UI
- `src/app/(dashboard)/shared/call/[appointmentId]/page.tsx` - call route

## Behavior

- Call route verifies authenticated user is part of appointment
- `VideoCall` fetches token from `/api/agora/token` and joins channel

## Next Step

Proceed to **06-03-PLAN.md** for waiting room and session timer.
