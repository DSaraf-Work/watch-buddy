# Feature: User Authentication

## Overview
Secure user authentication via Google OAuth (Better Auth + Cloudflare D1/KV).

## Requirements

### User Stories
- As a user, I want to sign in with my Google account
- As a user, I want to log out securely
- As a user, I want my session to persist across browser sessions

### Functional Requirements
1. **Sign In / Sign Up**
   - Google OAuth (`openid email profile`)
   - Auto-create account on first Google login
   - Profile row created via Better Auth database hook

2. **Logout**
   - Clear session
   - Redirect to login page

3. **Session Management**
   - Automatic session refresh
   - Protected routes
   - Redirect unauthenticated users

### Environment
- `BETTER_AUTH_SECRET` — session signing (required)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth client
- Redirect URI: `{BETTER_AUTH_URL}/api/auth/callback/google`

### UI Components
- LoginForm (Google sign-in button)
- AuthLayout

### Routes
- `/auth/login` — Sign in page
- `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password` — redirect to login

## Acceptance Criteria
- ✅ Users can sign in with Google
- ✅ New users are created on first login
- ✅ Users can log out
- ✅ Sessions persist across browser sessions
- ✅ Protected routes redirect unauthenticated users
- ✅ Profile created automatically on signup
