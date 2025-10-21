# Watch-Buddy Setup Guide

This guide will help you set up the Watch-Buddy project locally.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier is fine)
- A TMDB API account (free)

---

## Step 1: Install Dependencies

```bash
npm install
```

---

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: watch-buddy
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Wait for the project to be created (~2 minutes)

### 2.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" - keep this secret!)

### 2.3 Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the migration

Alternatively, if you have Supabase CLI installed:
```bash
npx supabase db push
```

---

## Step 3: Set Up TMDB API

### 3.1 Create TMDB Account

1. Go to [themoviedb.org](https://www.themoviedb.org/)
2. Sign up for a free account
3. Verify your email

### 3.2 Get API Key

1. Go to **Settings** → **API**
2. Click "Request an API Key"
3. Choose "Developer"
4. Fill in the application details:
   - **Application Name**: Watch-Buddy
   - **Application URL**: http://localhost:3000
   - **Application Summary**: Personal OTT tracking app
5. Accept the terms and submit
6. Copy your **API Key (v3 auth)** and **API Read Access Token (v4 auth)**

---

## Step 4: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Open `.env.local` and fill in your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# TMDB API
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_API_READ_ACCESS_TOKEN=your_tmdb_read_access_token_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the Watch-Buddy landing page! 🎉

---

## Step 6: Verify Setup

### 6.1 Test Database Connection

1. Open your browser's developer console
2. Navigate to http://localhost:3000
3. Check for any errors in the console
4. If you see no errors, the database connection is working!

### 6.2 Test Authentication (Once Implemented)

1. Click "Get Started" or "Sign Up"
2. Create a test account
3. Verify you can sign in and out

---

## Step 7: Install Playwright (Optional - for Testing)

```bash
npx playwright install
```

Run tests:
```bash
npm test
```

---

## Common Issues & Troubleshooting

### Issue: "Invalid API key" error

**Solution**: Double-check your Supabase credentials in `.env.local`. Make sure there are no extra spaces or quotes.

### Issue: TMDB API not working

**Solution**: 
- Verify your TMDB API key is correct
- Check if you've exceeded the rate limit (40 requests per 10 seconds)
- Make sure your TMDB account is verified

### Issue: Database migration failed

**Solution**:
- Check if the SQL syntax is correct
- Verify you have the necessary permissions
- Try running the migration again

### Issue: Port 3000 already in use

**Solution**:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
PORT=3001 npm run dev
```

---

## Next Steps

Now that your project is set up, you can:

1. **Review the architecture**: Check `docs/architecture.md`
2. **Review the implementation plan**: Check `dev/impl/master-implementation-plan.md`
3. **Start implementing features**: Follow the phase-wise plan
4. **Read feature requirements**: Check files in `dev/feature/`

---

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Testing
npm test             # Run Playwright tests
npm run test:ui      # Run tests with UI
```

---

## Project Structure

```
watch-buddy/
├── src/                    # Source code
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Utilities and configs
│   ├── types/             # TypeScript types
│   ├── hooks/             # Custom hooks
│   └── constants/         # Constants
├── supabase/              # Database migrations
├── tests/                 # Test files
├── dev/                   # Development docs
│   ├── feature/          # Feature requirements
│   └── impl/             # Implementation plans
└── docs/                  # Documentation
```

---

## Getting Help

- **Architecture Questions**: See `docs/architecture.md`
- **Feature Requirements**: See `dev/feature/`
- **Implementation Plans**: See `dev/impl/`
- **Agent Guidelines**: See `AGENTS.md`

---

**Happy Coding! 🚀**

