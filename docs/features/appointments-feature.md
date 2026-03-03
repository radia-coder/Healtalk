# Appointments Feature

## What We Built

We built full appointment flow between patient and psychologist.

## Main Actions

- Book appointment
- Cancel with confirmation
- Reschedule with date validation
- Join call from appointment context

## Routes and APIs

- Pages: `/checkout`, `/patient/dashboard/appointments`, `/psychologist/dashboard/appointments`
- APIs: `/api/appointments`, `/api/sessions`, `/api/agora/token`

## Notes

We prevent past-date scheduling in booking and reschedule flows.
