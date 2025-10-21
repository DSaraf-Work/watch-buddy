# Next Steps - Watch-Buddy

This document outlines the immediate next steps to get started with development.

---

## 🎯 Immediate Actions (Required Before Development)

### 1. Set Up Supabase (15 minutes)

#### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click "New Project"
4. Fill in:
   - Name: `watch-buddy`
   - Database Password: (choose strong password)
   - Region: (closest to you)
5. Wait ~2 minutes for project creation

#### Get Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (keep secret!)

#### Run Migration
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"

---

### 2. Set Up TMDB API (10 minutes)

#### Create Account
1. Go to [themoviedb.org](https://www.themoviedb.org/)
2. Sign up for free account
3. Verify email

#### Get API Key
1. Go to **Settings** → **API**
2. Click "Request an API Key"
3. Choose "Developer"
4. Fill in:
   - Application Name: `Watch-Buddy`
   - Application URL: `http://localhost:3000`
   - Application Summary: `Personal OTT tracking app`
5. Accept terms and submit
6. Copy:
   - **API Key (v3 auth)**
   - **API Read Access Token (v4 auth)**

---

### 3. Configure Environment Variables (2 minutes)

Edit `.env.local` and replace placeholders:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# TMDB API
TMDB_API_KEY=your_actual_tmdb_api_key
TMDB_API_READ_ACCESS_TOKEN=your_actual_tmdb_read_access_token

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 4. Verify Setup (5 minutes)

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

✅ You should see the landing page without errors!

---

## 🚀 Start Development - Phase 1: Authentication

Once setup is complete, start implementing Phase 1 features:

### Task 1.1: Authentication System (3 days)

**Reference**: `dev/feature/01-authentication.md`

#### Step 1: Create Auth Pages
Create these files:
- `src/app/(auth)/layout.tsx` - Auth layout
- `src/app/(auth)/login/page.tsx` - Login page
- `src/app/(auth)/signup/page.tsx` - Signup page
- `src/app/(auth)/forgot-password/page.tsx` - Forgot password
- `src/app/auth/callback/route.ts` - OAuth callback

#### Step 2: Create Auth Components
- `src/components/features/auth/LoginForm.tsx`
- `src/components/features/auth/SignupForm.tsx`
- `src/components/features/auth/ForgotPasswordForm.tsx`

#### Step 3: Create Auth Hooks
- `src/hooks/useAuth.ts` - Authentication hook
- `src/hooks/useUser.ts` - User data hook

#### Step 4: Create Auth Context
- `src/lib/auth/AuthProvider.tsx` - Auth context provider

#### Step 5: Write Tests
- `tests/e2e/auth/signup.spec.ts`
- `tests/e2e/auth/login.spec.ts`
- `tests/e2e/auth/logout.spec.ts`

#### Step 6: Test with Playwright
```bash
npm test
```

---

## 📋 Development Workflow

For each feature:

1. **Read Feature Requirements**
   - Check `dev/feature/[feature-name].md`

2. **Create Implementation Plan**
   - Create `dev/impl/[feature-name].md` if not exists
   - Break down into tasks

3. **Implement Feature**
   - Follow modular architecture
   - Maintain separation of concerns
   - Reuse existing code

4. **Write Tests**
   - Create E2E tests with Playwright
   - Test all user flows

5. **Test Manually**
   - Use Playwright MCP or Chrome MCP
   - Verify no bugs
   - Check all edge cases

6. **Update Documentation**
   - Update `docs/architecture.md` if needed
   - Update `PROJECT_STATUS.md`

7. **Commit Changes**
   - Write clear commit messages
   - Follow conventional commits

---

## 🎨 UI Component Development

When creating UI components:

1. **Check for Existing Components**
   - Look in `src/components/ui/`
   - Reuse if possible

2. **Create Reusable Components**
   - Use Radix UI primitives
   - Make them generic and flexible
   - Add TypeScript types

3. **Style with Tailwind**
   - Use utility classes
   - Follow design system
   - Ensure responsive

4. **Document Props**
   - Add JSDoc comments
   - Include usage examples

---

## 🗄️ Database Development

When adding database tables:

1. **Create Migration File**
   - `supabase/migrations/[number]_[name].sql`
   - Use sequential numbering

2. **Define Schema**
   - Include all columns
   - Add indexes
   - Set up foreign keys

3. **Add RLS Policies**
   - Enable RLS on table
   - Create policies for SELECT, INSERT, UPDATE, DELETE
   - Test policies

4. **Update Types**
   - Update `src/types/database.ts`
   - Add TypeScript interfaces

5. **Run Migration**
   - In Supabase SQL Editor
   - Or use Supabase CLI

---

## 🧪 Testing Guidelines

### E2E Testing with Playwright

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path')
    
    // Test actions
    await page.getByRole('button', { name: 'Click Me' }).click()
    
    // Assertions
    await expect(page.getByText('Success')).toBeVisible()
  })
})
```

### Run Tests
```bash
# All tests
npm test

# Specific test file
npx playwright test tests/e2e/auth/login.spec.ts

# With UI
npm run test:ui

# Debug mode
npx playwright test --debug
```

---

## 📚 Helpful Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/docs)
- [Playwright Docs](https://playwright.dev/docs/intro)

### Project Docs
- Architecture: `docs/architecture.md`
- Setup Guide: `SETUP.md`
- Agent Guidelines: `AGENTS.md`
- Implementation Plan: `dev/impl/master-implementation-plan.md`

---

## 🎯 Success Criteria

Before moving to next phase, ensure:

- ✅ All Phase 1 features implemented
- ✅ All E2E tests passing
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ Code formatted with Prettier
- ✅ Documentation updated
- ✅ Manual testing complete
- ✅ No console errors

---

## 💡 Tips

1. **Start Small**: Implement one feature at a time
2. **Test Early**: Write tests as you code
3. **Commit Often**: Small, focused commits
4. **Ask Questions**: Check documentation first
5. **Follow Patterns**: Look at existing code for examples
6. **Stay Organized**: Keep files in correct directories
7. **Be Consistent**: Follow naming conventions
8. **Document Changes**: Update architecture doc

---

## 🚨 Common Pitfalls to Avoid

1. ❌ Don't skip RLS policies
2. ❌ Don't hardcode credentials
3. ❌ Don't duplicate code
4. ❌ Don't skip tests
5. ❌ Don't ignore TypeScript errors
6. ❌ Don't break existing features
7. ❌ Don't forget to update docs
8. ❌ Don't commit .env.local

---

## 📞 Need Help?

1. Check `SETUP.md` for setup issues
2. Check `docs/architecture.md` for architecture questions
3. Check `dev/feature/` for feature requirements
4. Check `AGENTS.md` for development guidelines

---

**Ready to start? Complete the setup steps above, then begin with Phase 1: Authentication!**

Good luck! 🚀

