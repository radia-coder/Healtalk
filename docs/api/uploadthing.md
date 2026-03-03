# UploadThing Setup (File Uploads)

UploadThing handles image/document uploads.

## What uses it

- User avatar uploads
- Message attachments
- Psychologist credential document uploads

## Env vars

Use one of these keys:

```bash
UPLOADTHING_TOKEN=...
# or
UPLOADTHING_SECRET=...
# or
UPLOADTHING_KEY=...
```

Current code accepts token first, then secret, then key.

## Step by step: get key

1. Go to https://uploadthing.com
2. Create app/project.
3. Copy token or secret from dashboard.
4. Add it to `.env` and DigitalOcean.

## How it helps this project

- Secure upload flow
- File limits by type/size
- Private credential document handling
