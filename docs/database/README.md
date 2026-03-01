# Backend Integration Guide

## Setup Instructions

### 1. Database Setup

**Install PostgreSQL** (if not already installed):

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb psyconnect
```

**Configure Environment Variables**:

```bash
# Copy example file
cp .env.example .env

# Edit .env and update DATABASE_URL with your credentials
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/psyconnect?schema=public"
```

**Initialize Prisma**:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates database tables)
npx prisma migrate dev --name init

# Seed database with sample data (optional)
npx prisma db seed
```

### 2. Authentication Setup

**Configure NextAuth**:

1. Generate a secret key:

   ```bash
   openssl rand -base64 32
   ```

2. Add to `.env`:
   ```
   NEXTAUTH_SECRET="your-generated-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

**OAuth Providers (Optional)**:

For Google:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth credentials
5. Add to `.env`:
   ```
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

For Facebook:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Get App ID and Secret
5. Add to `.env`:
   ```
   FACEBOOK_CLIENT_ID="your-app-id"
   FACEBOOK_CLIENT_SECRET="your-app-secret"
   ```

### 3. API Routes

All API routes are created in `src/app/api/`:

**Available Endpoints**:

- `POST /api/auth/[...nextauth]` - Authentication
- `GET /api/psychologists` - List psychologists (with filters)
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `GET /api/messages` - List messages (TODO)
- `POST /api/messages` - Send message (TODO)

**Example API Call**:

```typescript
// Fetch psychologists
const response = await fetch(
  "/api/psychologists?location=Istanbul&minRating=4.5",
);
const psychologists = await response.json();

// Create appointment (requires authentication)
const response = await fetch("/api/appointments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    psychologistId: "clxxx",
    date: "2026-02-01",
    startTime: "2026-02-01T14:00:00Z",
    endTime: "2026-02-01T15:00:00Z",
    duration: 60,
    type: "VIDEO",
  }),
});
```

### 4. Protected Routes

Use Next.js middleware to protect routes:

```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;

      if (path.startsWith("/patient")) {
        return token?.role === "PATIENT";
      }
      if (path.startsWith("/psychologist")) {
        return token?.role === "PSYCHOLOGIST";
      }
      if (path.startsWith("/admin")) {
        return token?.role === "ADMIN";
      }

      return !!token;
    },
  },
});

export const config = {
  matcher: ["/patient/:path*", "/psychologist/:path*", "/admin/:path*"],
};
```

### 5. Testing

**Run Tests**:

```bash
# Unit tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

**Example Test**:

```typescript
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

test('renders homepage', () => {
  render(<HomePage />);
  expect(screen.getByText(/PsyConnect/i)).toBeInTheDocument();
});
```

### 6. Real-time Features (Socket.io)

**Install Socket.io**:

```bash
npm install socket.io socket.io-client
```

**Server Setup** (`src/app/api/socket/route.ts`):

```typescript
import { Server } from "socket.io";

export function GET(req: Request) {
  const io = new Server({
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("send_message", (data) => {
      io.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return new Response("Socket.io server running");
}
```

**Client Usage**:

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.emit("send_message", { text: "Hello!" });

socket.on("receive_message", (data) => {
  console.log("New message:", data);
});
```

### 7. Video Calls (Agora.io Example)

**Install Agora SDK**:

```bash
npm install agora-rtc-sdk-ng
```

**Setup**:

1. Sign up at [Agora.io](https://www.agora.io/)
2. Create a project
3. Get App ID and Certificate
4. Add to `.env`:
   ```
   AGORA_APP_ID="your-app-id"
   AGORA_APP_CERTIFICATE="your-certificate"
   ```

**Basic Implementation**:

```typescript
import AgoraRTC from "agora-rtc-sdk-ng";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// Join channel
await client.join(APP_ID, CHANNEL, TOKEN, UID);

// Publish local tracks
const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
await client.publish([localVideoTrack, localAudioTrack]);
```

## Development Workflow

1. **Start development server**:

   ```bash
   npm run dev
   ```

2. **Run Prisma Studio** (database GUI):

   ```bash
   npx prisma studio
   ```

3. **Watch for database changes**:

   ```bash
   npx prisma migrate dev
   ```

4. **Run tests in watch mode**:
   ```bash
   npm test -- --watch
   ```

## Production Deployment

### Environment Variables

Set these in your production environment:

- `DATABASE_URL` - Production database connection
- `NEXTAUTH_SECRET` - Strong random secret
- `NEXTAUTH_URL` - Production domain
- OAuth credentials (if using)
- Email service credentials
- Payment gateway keys
- Video service credentials

### Database Migration

```bash
# Run migrations in production
npx prisma migrate deploy
```

### Build

```bash
npm run build
npm start
```

## Troubleshooting

**Prisma Client not found**:

```bash
npx prisma generate
```

**Database connection errors**:

- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Check database user permissions

**Auth not working**:

- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Verify OAuth credentials

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Agora.io Documentation](https://docs.agora.io/)
