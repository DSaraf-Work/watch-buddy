# Feature: User Authentication

## Overview
Secure user authentication system using Supabase Auth with email/password.

## Requirements

### User Stories
- As a user, I want to sign up with my email and password
- As a user, I want to log in with my credentials
- As a user, I want to log out securely
- As a user, I want to reset my password if forgotten
- As a user, I want my session to persist across browser sessions

### Functional Requirements
1. **Sign Up**
   - Unique email validation
   - Password strength requirements (min 8 chars, 1 uppercase, 1 number)
   - Email verification (optional for v1)
   - Auto-login after successful signup

2. **Login**
   - Email/password authentication
   - Remember me functionality
   - Error handling for invalid credentials

3. **Logout**
   - Clear session
   - Redirect to login page

4. **Password Reset**
   - Send reset email
   - Secure reset token
   - Update password flow

5. **Session Management**
   - Automatic session refresh
   - Protected routes
   - Redirect unauthenticated users

### Database Schema
```sql
-- Users table (managed by Supabase Auth)
-- Extended with custom profile table

CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### UI Components
- SignUpForm
- LoginForm
- ForgotPasswordForm
- ResetPasswordForm
- AuthLayout
- ProtectedRoute wrapper

### Routes
- `/auth/signup` - Sign up page
- `/auth/login` - Login page
- `/auth/forgot-password` - Forgot password page
- `/auth/reset-password` - Reset password page
- `/auth/callback` - OAuth callback handler

## Acceptance Criteria
- ✅ Users can sign up with unique email and password
- ✅ Users can log in with valid credentials
- ✅ Users can log out
- ✅ Users can reset forgotten passwords
- ✅ Sessions persist across browser sessions
- ✅ Protected routes redirect unauthenticated users
- ✅ Profile created automatically on signup
- ✅ Form validation works correctly
- ✅ Error messages are user-friendly

## Success Metrics
- Successful signup rate > 95%
- Login success rate > 98%
- Password reset completion rate > 80%

