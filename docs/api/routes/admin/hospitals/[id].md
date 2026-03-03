# Endpoint: `/api/admin/hospitals/[id]`

## Overview

We use this API endpoint to handle backend logic for this part of the product.

## Source

- Source file: `src/app/api/admin/hospitals/[id]/route.ts`
- Endpoint: `/api/admin/hospitals/[id]`
- Methods we expose: `PATCH`, `DELETE`

## What We Check

- We return clear success and error responses.
- We keep auth/rate-limit/security checks when needed.
- We test this endpoint after changing related UI flows.

## Notes

We update this endpoint doc whenever request shape or response shape changes.
