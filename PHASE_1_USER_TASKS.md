# Phase 1: User Setup & Testing Tasks

**Phase**: Authentication System  
**Status**: Ready for User Setup  
**Estimated Setup Time**: 20-25 minutes

---

## 📋 Part A: User Setup Tasks (Required Before Testing)

### Task 1: Create Supabase Project (10 minutes)

#### Step 1.1: Create Account & Project [Done]
1. Go to [supabase.com](https://supabase.com)
2. Sign in or create a free account
3. Click **"New Project"**
4. Fill in project details:
   - **Name**: `watch-buddy`
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Select closest to your location
   - **Pricing Plan**: Free tier is fine
5. Click **"Create new project"**
6. Wait ~2 minutes for project to be created

#### Step 1.2: Get API Credentials[Done]
1. Once project is ready, go to **Settings** (gear icon in sidebar)
2. Click **API** in the settings menu
3. Copy these values (you'll need them in next step):
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - click "Reveal" to see it)

⚠️ **IMPORTANT**: Keep the `service_role` key secret! Never commit it to git or share publicly.

#### Step 1.3: Run Database Migration [AI Agent Auggie should Run it itself using mcp server] 
1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **"New Query"**
3. Open the file `supabase/migrations/001_initial_schema.sql` in your code editor
4. Copy the entire contents
5. Paste into the Supabase SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned" message
8. Verify the migration:
   - Click **Table Editor** in sidebar
   - You should see a `profiles` table

---

### Task 2: Get TMDB API Key (10 minutes)

#### Step 2.1: Create TMDB Account
1. Go to [themoviedb.org](https://www.themoviedb.org/)
2. Click **"Join TMDB"** (top right)
3. Fill in signup form
4. Verify your email address

#### Step 2.2: Request API Key
1. Log in to TMDB
2. Click your profile icon → **Settings**
3. Click **API** in the left sidebar
4. Click **"Request an API Key"**
5. Choose **"Developer"**
6. Fill in the application form:
   - **Type of Use**: Personal/Educational
   - **Application Name**: `Watch-Buddy`
   - **Application URL**: `http://localhost:3000`
   - **Application Summary**: `Personal OTT watch history and watchlist tracking application`
7. Accept the terms and click **"Submit"**
8. Copy your **API Key (v3 auth)**
9. Also copy the **API Read Access Token (v4 auth)** if shown

---

### Task 3: Configure Environment Variables (2 minutes)

1. Open the file `.env.local` in your code editor
2. Replace the placeholder values with your actual credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# TMDB API
TMDB_API_KEY=your_actual_tmdb_api_key_here
TMDB_API_READ_ACCESS_TOKEN=your_actual_tmdb_read_access_token_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Save the file
4. **Restart your development server** if it's running:
   ```bash
   # Stop the server (Ctrl+C) then restart:
   npm run dev
   ```

---

### Task 4: Install Playwright Browsers (2 minutes)

1. Run the following command to install Playwright browsers:
   ```bash
   npx playwright install
   ```
2. This will download Chromium, Firefox, and WebKit browsers for testing
3. Wait for the installation to complete (~1-2 minutes)

### Task 5: Verify Setup (3 minutes)

1. Open your browser to [http://localhost:3000](http://localhost:3000)
2. Open browser console (F12 or Cmd+Option+I)
3. Check for errors:
   - ✅ No Supabase connection errors
   - ✅ No "invalid API key" errors
   - ✅ Page loads correctly

If you see errors, double-check your environment variables.

---

## 🧪 Part B: User Testing Checklist

Once setup is complete and I've implemented Phase 1, test the following:

### Test Group 1: Signup Flow ✅

**Test 1.1: Successful Signup**
- [ ] Navigate to signup page
- [ ] Enter valid email (use a real email you can access)
- [ ] Enter valid password (min 6 characters)
- [ ] Enter display name
- [ ] Click "Sign Up"
- [ ] Verify: Redirected to dashboard
- [ ] Verify: Welcome message shows your display name
- [ ] Verify: No error messages

**Test 1.2: Signup Validation**
- [ ] Try signup with invalid email format
- [ ] Verify: Error message shows "Invalid email"
- [ ] Try signup with password < 6 characters
- [ ] Verify: Error message shows password requirement
- [ ] Try signup with empty fields
- [ ] Verify: Error messages show for required fields
- [ ] Try signup with existing email
- [ ] Verify: Error message shows "Email already registered"

**Test 1.3: Email Confirmation (if enabled)**
- [ ] Check your email inbox
- [ ] Verify: Confirmation email received
- [ ] Click confirmation link
- [ ] Verify: Email confirmed successfully

---

### Test Group 2: Login Flow ✅

**Test 2.1: Successful Login**
- [ ] Log out if logged in
- [ ] Navigate to login page
- [ ] Enter registered email
- [ ] Enter correct password
- [ ] Click "Log In"
- [ ] Verify: Redirected to dashboard
- [ ] Verify: User info displayed correctly
- [ ] Verify: No error messages

**Test 2.2: Login Validation**
- [ ] Try login with wrong password
- [ ] Verify: Error message shows "Invalid credentials"
- [ ] Try login with non-existent email
- [ ] Verify: Error message shows "Invalid credentials"
- [ ] Try login with empty fields
- [ ] Verify: Error messages show for required fields

**Test 2.3: Remember Me / Session Persistence**
- [ ] Log in successfully
- [ ] Close browser tab
- [ ] Open new tab to [http://localhost:3000](http://localhost:3000)
- [ ] Verify: Still logged in (redirected to dashboard)

---

### Test Group 3: Logout Flow ✅

**Test 3.1: Successful Logout**
- [ ] While logged in, click "Log Out" button
- [ ] Verify: Redirected to home or login page
- [ ] Verify: No user info displayed
- [ ] Try to access dashboard directly
- [ ] Verify: Redirected to login page

---

### Test Group 4: Forgot Password Flow ✅

**Test 4.1: Password Reset Request**
- [ ] Navigate to login page
- [ ] Click "Forgot Password?" link
- [ ] Enter registered email
- [ ] Click "Send Reset Link"
- [ ] Verify: Success message shows
- [ ] Check email inbox
- [ ] Verify: Password reset email received

**Test 4.2: Password Reset Completion**
- [ ] Click reset link in email
- [ ] Enter new password
- [ ] Confirm new password
- [ ] Click "Reset Password"
- [ ] Verify: Success message shows
- [ ] Try logging in with new password
- [ ] Verify: Login successful

**Test 4.3: Password Reset Validation**
- [ ] Try reset with non-existent email
- [ ] Verify: Generic success message (security best practice)
- [ ] Try reset with mismatched passwords
- [ ] Verify: Error message shows

---

### Test Group 5: Protected Routes ✅

**Test 5.1: Route Protection When Logged Out**
- [ ] Log out completely
- [ ] Try to access `/dashboard` directly
- [ ] Verify: Redirected to login page
- [ ] Try to access `/search` directly
- [ ] Verify: Redirected to login page
- [ ] Try to access `/watchlist` directly
- [ ] Verify: Redirected to login page
- [ ] Try to access `/profile` directly
- [ ] Verify: Redirected to login page

**Test 5.2: Route Access When Logged In**
- [ ] Log in successfully
- [ ] Navigate to `/dashboard`
- [ ] Verify: Dashboard loads correctly
- [ ] Try to access `/auth/login`
- [ ] Verify: Redirected to dashboard (already logged in)
- [ ] Try to access `/auth/signup`
- [ ] Verify: Redirected to dashboard (already logged in)

---

### Test Group 6: Profile Management ✅

**Test 6.1: View Profile**
- [ ] While logged in, navigate to profile page
- [ ] Verify: Email displayed correctly
- [ ] Verify: Display name shown correctly
- [ ] Verify: Avatar placeholder or image shown

**Test 6.2: Update Profile**
- [ ] Click "Edit Profile" or similar button
- [ ] Change display name
- [ ] Click "Save"
- [ ] Verify: Success message shows
- [ ] Refresh page
- [ ] Verify: New display name persists
- [ ] Check dashboard
- [ ] Verify: Updated name shows everywhere

**Test 6.3: Profile Validation**
- [ ] Try to save empty display name
- [ ] Verify: Error message or validation prevents save

---

### Test Group 7: UI/UX Testing ✅

**Test 7.1: Responsive Design**
- [ ] Test on desktop (1920x1080)
- [ ] Verify: Layout looks good
- [ ] Test on tablet (768px width)
- [ ] Verify: Layout adapts correctly
- [ ] Test on mobile (375px width)
- [ ] Verify: Layout is mobile-friendly
- [ ] Verify: All buttons are tappable
- [ ] Verify: Forms are usable on mobile

**Test 7.2: Loading States**
- [ ] During signup, observe loading state
- [ ] Verify: Button shows loading indicator
- [ ] Verify: Button is disabled during submission
- [ ] During login, observe loading state
- [ ] Verify: Loading feedback is clear

**Test 7.3: Error Display**
- [ ] Trigger various errors (wrong password, etc.)
- [ ] Verify: Error messages are clear and helpful
- [ ] Verify: Errors are displayed prominently
- [ ] Verify: Errors clear when corrected

**Test 7.4: Accessibility**
- [ ] Tab through all forms
- [ ] Verify: Tab order is logical
- [ ] Verify: All inputs are keyboard accessible
- [ ] Verify: Focus indicators are visible
- [ ] Test with screen reader (if available)
- [ ] Verify: Labels are read correctly

---

### Test Group 8: Edge Cases & Security ✅

**Test 8.1: Session Handling**
- [ ] Log in on one browser tab
- [ ] Open another tab
- [ ] Verify: Both tabs show logged-in state
- [ ] Log out in one tab
- [ ] Verify: Other tab also logs out (or shows logged out on next action)

**Test 8.2: Browser Back/Forward**
- [ ] Log in and navigate to dashboard
- [ ] Click browser back button
- [ ] Verify: Appropriate behavior (doesn't break auth)
- [ ] Click forward button
- [ ] Verify: Returns to dashboard correctly

**Test 8.3: Direct URL Access**
- [ ] While logged out, try accessing `/dashboard?some=param`
- [ ] Verify: Redirected to login
- [ ] After login, verify: Redirected back to `/dashboard?some=param`

**Test 8.4: XSS Prevention**
- [ ] Try entering `<script>alert('xss')</script>` in display name
- [ ] Verify: Script doesn't execute
- [ ] Verify: Input is sanitized or escaped

---

## ✅ Phase 1 Completion Criteria

Mark Phase 1 as complete when:

- ✅ All setup tasks completed successfully
- ✅ All Test Groups 1-8 pass without issues
- ✅ No console errors in browser
- ✅ No TypeScript errors in code
- ✅ All E2E tests pass (`npm test`)
- ✅ Application is responsive on mobile, tablet, desktop
- ✅ Authentication flows work smoothly
- ✅ Protected routes are properly secured
- ✅ User data persists correctly in Supabase

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid API credentials" error
**Solution**: Double-check your `.env.local` file has correct Supabase URL and keys. Restart dev server.

### Issue: "Failed to fetch" or CORS errors
**Solution**: Ensure Supabase project is active and URL is correct. Check Supabase dashboard status.

### Issue: Email confirmation not received
**Solution**: Check spam folder. In Supabase dashboard, go to Authentication → Settings and verify email settings.

### Issue: Can't log in after signup
**Solution**: Check if email confirmation is required in Supabase settings. Disable it for development if needed.

### Issue: Profile not created after signup
**Solution**: Check Supabase SQL Editor for errors. Verify the trigger `on_auth_user_created` exists and is enabled.

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Supabase dashboard logs
3. Verify all environment variables are set correctly
4. Ensure database migration ran successfully
5. Report the specific error message and steps to reproduce

---

**Ready to test?** Complete Part A (Setup Tasks) first, then proceed with Part B (Testing Checklist) after implementation is complete!

