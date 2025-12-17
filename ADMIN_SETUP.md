# Admin Panel Setup Guide

## Overview
Your admin panel is protected with a hidden URL path and Firebase Authentication. The admin route is not discoverable through normal navigation.

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication** → **Sign-in method** → **Email/Password**
4. Go to **Project Settings** → **Service Accounts**
5. Click **Generate New Private Key** to download the service account JSON
6. Copy the service account JSON content

### 2. Create Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# Admin Configuration
# Generate a random string for ADMIN_PATH (e.g., use: openssl rand -hex 16)
ADMIN_PATH=a8f3k2j9x7m1n5p

# Firebase Client Configuration (from Firebase Console → Project Settings → General)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin (Service Account JSON as a single-line string)
# Paste the entire JSON content here, or use a JSON string
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# Admin Emails (comma-separated list of emails allowed to access admin)
ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

### 3. Generate Secure Values

**For ADMIN_PATH:**
```bash
# Generate a random path (16 characters)
openssl rand -hex 16
```

**For FIREBASE_SERVICE_ACCOUNT_KEY:**
- Download the service account JSON from Firebase Console
- Convert it to a single-line string (remove newlines)
- Or use a tool like `jq -c .` to minify the JSON

### 4. Create Admin User in Firebase

1. Go to Firebase Console → **Authentication** → **Users**
2. Click **Add User**
3. Enter the email and password for your admin account
4. Make sure this email is in your `ADMIN_EMAILS` environment variable

### 5. Access Your Admin Panel

Once configured, access your admin panel at:
```
http://localhost:3000/[YOUR_ADMIN_PATH]
```

For example, if your `ADMIN_PATH` is `a8f3k2j9x7m1n5p`, the URL would be:
```
http://localhost:3000/a8f3k2j9x7m1n5p
```

You'll be prompted to login with your Firebase email and password.

### 6. Security Features

- **Hidden URL**: The admin path is not discoverable through normal navigation
- **Firebase Authentication**: Uses Firebase Auth for secure email/password authentication
- **Email Whitelist**: Only emails in `ADMIN_EMAILS` can access the admin panel
- **Session Management**: Uses secure HTTP-only cookies with Firebase session tokens
- **Middleware Protection**: All admin routes are protected at the middleware level

### 7. Important Notes

⚠️ **Security Reminders:**
- Never commit your `.env.local` file to version control
- Change the default `ADMIN_PATH` to something unique
- Only add trusted emails to `ADMIN_EMAILS`
- Keep your Firebase service account key secure
- In production, ensure all environment variables are set in your hosting platform (Vercel, etc.)
- Use strong passwords for Firebase admin accounts

### 8. Production Deployment

When deploying to production (e.g., Vercel):
1. Add all environment variables in your hosting platform's dashboard:
   - `ADMIN_PATH`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `FIREBASE_SERVICE_ACCOUNT_KEY` (as a single-line JSON string)
   - `ADMIN_EMAILS`
2. Use the same values or generate new ones for production
3. The admin panel will be accessible at: `https://yourdomain.com/[YOUR_ADMIN_PATH]`
4. Make sure your Firebase project allows your production domain in Authentication settings

## File Structure

```
src/
├── lib/
│   ├── firebase.ts                  # Firebase client config
│   └── firebase-admin.ts            # Firebase admin config
├── middleware.ts                    # Protects admin routes
├── app/
│   ├── [adminPath]/                 # Dynamic admin route
│   │   ├── page.tsx                 # Admin dashboard
│   │   └── login/
│   │       └── page.tsx             # Login page
│   └── api/
│       └── admin/
│           ├── login/route.ts        # Firebase login API
│           ├── logout/route.ts      # Logout API
│           ├── check/route.ts       # Auth check API
│           └── verify-path/route.ts # Path verification API
```

## Next Steps

You can now extend the admin panel to include:
- Content management for your portfolio
- Analytics dashboard
- Settings management
- Project/achievement CRUD operations
