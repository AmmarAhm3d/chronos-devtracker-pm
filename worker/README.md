# Chronos DevTracker - Cloudflare Workers Backend

This is the Cloudflare Workers implementation of the Chronos DevTracker backend API, using Hono framework and Prisma Accelerate for edge-compatible database access.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono (lightweight, edge-compatible)
- **Database**: PostgreSQL on Neon (serverless) via Prisma Accelerate
- **ORM**: Prisma with `@prisma/extension-accelerate`
- **Auth**: JWT using Web Crypto API (edge-compatible)
- **Password Hashing**: PBKDF2 via Web Crypto API (replaces bcryptjs)
- **Validation**: Zod

## Features

✅ Zero cold start issues  
✅ Edge deployment for global low latency  
✅ Free tier compatible  
✅ 100% API compatible with Express backend  
✅ Same route paths and response formats  
✅ JWT authentication with HS256  

## Directory Structure

```
worker/
├── src/
│   ├── index.ts              # Main worker entry with Hono
│   ├── routes/
│   │   ├── auth.ts           # /api/auth/register, /api/auth/login
│   │   ├── projects.ts       # CRUD for projects + POST /:id/tasks
│   │   └── tasks.ts          # PUT/DELETE for tasks
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client with Accelerate extension
│   │   ├── jwt.ts            # JWT sign/verify using Web Crypto API
│   │   └── crypto.ts         # Password hash/verify using PBKDF2
│   └── middleware/
│       ├── auth.ts           # Bearer token authentication
│       └── validate.ts       # Zod validation middleware
├── prisma/
│   └── schema.prisma         # Same schema as server
├── wrangler.toml             # Cloudflare Workers config
├── package.json
└── tsconfig.json
```

## Prerequisites

1. **Cloudflare Account** (free tier works)
2. **Wrangler CLI** - Install globally:
   ```bash
   npm install -g wrangler
   ```
3. **Neon Database** with Prisma Accelerate enabled
4. **Node.js 18+**

## Setup

### 1. Install Dependencies

```bash
cd worker
npm install
```

### 2. Set Up Prisma Accelerate

1. Go to [Prisma Data Platform](https://cloud.prisma.io/)
2. Create a new project
3. Connect your Neon database
4. Enable Accelerate
5. Copy the **Accelerate connection string** (starts with `prisma://accelerate.prisma-data.net`)

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Configure Secrets

Set your secrets using Wrangler:

```bash
# Set DATABASE_URL (Prisma Accelerate connection string)
wrangler secret put DATABASE_URL

# Set JWT_SECRET (use a strong random string)
wrangler secret put JWT_SECRET
```

### 5. Login to Cloudflare

```bash
wrangler login
```

## Development

### Local Development

```bash
npm run dev
```

This starts a local development server with hot reload. The API will be available at `http://localhost:8787`.

**Note**: For local development, create a `.dev.vars` file with your secrets:

```env
DATABASE_URL=prisma://accelerate.prisma-data.net/...
JWT_SECRET=your-secret-key
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:8787/health

# Register user
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Create project (with auth token)
curl -X POST http://localhost:8787/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"My Project","description":"Test project"}'
```

## Deployment

### Deploy to Cloudflare Workers

```bash
npm run deploy
```

This will:
1. Bundle your application
2. Deploy to Cloudflare Workers
3. Provide you with a production URL (e.g., `https://chronos-devtracker-api.YOURNAME.workers.dev`)

### View Logs

```bash
npm run tail
```

This streams real-time logs from your deployed worker.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Projects (Auth Required)
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/projects/:id/tasks` - Create task for project

### Tasks (Auth Required)
- `PUT /api/tasks/:taskId` - Update a task
- `DELETE /api/tasks/:taskId` - Delete a task

### Health & Info
- `GET /health` - Health check
- `GET /healthz` - Health check (alternative)
- `GET /` - API info
- `GET /api` - API routes info

## Environment Variables

Configure in `wrangler.toml` or via `wrangler secret put`:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Prisma Accelerate connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `ENVIRONMENT` | Environment name (set in wrangler.toml) | No |

## Differences from Express Backend

### Edge-Compatible Implementations

1. **Password Hashing**: Uses PBKDF2 via Web Crypto API instead of bcryptjs
   - 100,000 iterations with SHA-256
   - Format: `salt:hash` (both hex-encoded)

2. **JWT**: Uses Web Crypto API HMAC-SHA256 instead of jsonwebtoken
   - Standard JWT format (HS256)
   - Same expiration and payload structure

3. **Prisma**: Uses Prisma Accelerate extension for edge runtime
   - Connection pooling handled by Accelerate
   - Optimized for edge latency

### Framework Changes

- **Express → Hono**: Lightweight, edge-compatible framework
- Similar middleware patterns
- Same route structure and handlers

## Troubleshooting

### "prisma is not defined" Error

Generate the Prisma client:
```bash
npm run prisma:generate
```

### Database Connection Issues

Ensure you're using the Prisma Accelerate connection string (starts with `prisma://`), not the direct database URL.

### JWT Token Errors

Verify that `JWT_SECRET` is set correctly:
```bash
wrangler secret list
```

### Deploy Fails

Check your wrangler.toml configuration and ensure you're logged in:
```bash
wrangler whoami
```

## Migration from Express Backend

To migrate your existing frontend to use this worker:

1. Deploy the worker and get the production URL
2. Update your frontend's `API_URL` environment variable
3. No code changes needed - API is 100% compatible!

## Free Tier Limits

Cloudflare Workers free tier includes:
- 100,000 requests per day
- 10ms CPU time per request
- More than sufficient for development and small-scale production use

Neon free tier includes:
- 512 MB storage
- 3 GiB data transfer per month

Prisma Accelerate free tier includes:
- 1M query events per month

## Security

- Passwords hashed with PBKDF2 (100,000 iterations)
- JWT tokens with configurable expiration (default 7 days)
- CORS enabled for cross-origin requests
- Environment secrets managed by Cloudflare

## Contributing

This worker implementation maintains 100% API compatibility with the Express backend. When making changes:

1. Keep route paths and response formats identical
2. Test against the existing frontend
3. Ensure edge-runtime compatibility (no Node.js-specific APIs)

## License

Same as the main Chronos DevTracker project.
