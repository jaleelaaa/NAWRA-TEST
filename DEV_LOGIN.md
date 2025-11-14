# Quick Development Login

To access the Settings page (and all admin pages), you need to be authenticated.

## ⚠️ PREREQUISITE: Create Mock Dev User

**IMPORTANT:** Before using the dev-login helper, you must create the mock dev user in your database.

👉 **See [RUN_DEV_USER_MIGRATION.md](RUN_DEV_USER_MIGRATION.md) for instructions**

This is a one-time setup. The mock user is needed because the dev-login uses a specific user ID that must exist in the database.

---

## Option 1: Dev Login Helper (Easiest)

Open `dev-login.html` in your browser and click the "Login as Test Admin & Go to Settings" button.

This will:
- Set mock authentication in localStorage
- Enable dev mode (bypasses JWT requirement)
- Automatically redirect you to the Settings page

## Option 2: Use the Login Page (Recommended for Production Testing)

1. Go to: http://localhost:3000/en/login
2. Use your test credentials to log in
3. You'll be redirected to the dashboard
4. Then navigate to Settings

## Option 3: Manual Dev Bypass (Testing Only)

If you prefer to use the browser console:

### Step 1: Open Browser Console

1. Go to: http://localhost:3000/en/admin/settings
2. Press `F12` to open DevTools
3. Click on the **Console** tab

### Step 2: Run This Code

Copy and paste this into the console and press Enter:

```javascript
// Set mock authentication data
const mockAuthData = {
  state: {
    user: {
      id: "00000000-0000-0000-0000-000000000001",
      email: "admin@nawra.om",
      full_name: "Test Admin",
      role: "Administrator",
      user_type: "staff"
    },
    isAuthenticated: true
  },
  version: 0
};

// Store in localStorage
localStorage.setItem('auth-storage', JSON.stringify(mockAuthData));

// Enable dev mode (bypasses JWT auth requirement)
localStorage.setItem('dev-mode', 'true');
localStorage.setItem('dev-user-id', '00000000-0000-0000-0000-000000000001');

// Reload the page
window.location.reload();
```

### Step 3: Refresh

The page will reload automatically and you'll be logged in as "Test Admin" with dev mode enabled!

## Option 4: Create a Test User (Backend)

If you want a proper test login:

1. Access your Supabase dashboard
2. Go to **Authentication** → **Users**
3. Create a test user or use existing credentials
4. Log in via http://localhost:3000/en/login

## To Logout

Either:
- Click your avatar in the top right → Logout
- Or run in console: `localStorage.clear(); location.reload()`

---

**After Login:** Navigate to http://localhost:3000/en/admin/settings and you should see the Settings page!
