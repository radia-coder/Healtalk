# Agora Setup (Video Calls)

Agora is used for live video session tokens.

## Env vars

```bash
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
```

## Step by step: get Agora keys

1. Go to https://console.agora.io
2. Create project.
3. Copy App ID.
4. Enable App Certificate and copy certificate.
5. Add both in `.env` and DigitalOcean.

## How it helps this project

- `/api/agora/token` creates secure temporary token.
- Patient and therapist can join call if authorized.

## Common issue

If you see "missing tokens" in app:
- one of the two keys is missing
- or wrong key in production env vars
