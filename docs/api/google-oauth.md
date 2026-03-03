# Google OAuth Setup

Google OAuth lets users sign in with Google account.

## Env vars

```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=https://finalproject.app
```

## Step by step: create Google OAuth credentials

1. Go to https://console.cloud.google.com
2. Create or open a project.
3. Go to APIs & Services -> Credentials.
4. Click Create Credentials -> OAuth client ID.
5. Choose Web application.
6. Add Authorized JavaScript origins:
- `http://localhost:3000`
- `https://finalproject.app`
7. Add Authorized redirect URIs:
- `http://localhost:3000/api/auth/callback/google`
- `https://finalproject.app/api/auth/callback/google`
8. Save and copy Client ID and Client Secret.
9. Add both keys to `.env` and DigitalOcean env vars.

## If you also use Supabase Google login

Add this redirect too in Google Console:
- `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

## How it helps this project

- Faster sign up/login.
- Users do not need password for Google sign in.
