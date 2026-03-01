# Testing — HealTalk

This folder covers how HealTalk is tested — from manual flow tests to automated unit tests.

## Testing Stack

- **Jest** — unit and integration tests (`jest.config.ts`, `jest.setup.ts`)
- **Manual testing** — appointment flows, auth flows, video calls

## What We Test

### Automated (Jest)
- UI component rendering (`src/components/ui/__tests__/`)
- API route logic
- Utility functions in `src/lib/`

### Manual Flows
- Full appointment booking flow (patient books → psychologist confirms → video call)
- Authentication (signup, login, OAuth, email verification, password reset)
- Psychologist onboarding (apply → admin approves → profile complete)
- Messaging between patient and psychologist
- Mood tracker and progress goal creation

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run a specific test file
npm test -- src/components/ui/__tests__/button.test.tsx
```

## Files in This Folder

- `README.md` — This file (testing overview)
- `guide.md` — Full testing guide and test cases
- `results.md` — Latest test run results
- `appointment-flow.md` — Detailed manual test for the appointment booking flow
