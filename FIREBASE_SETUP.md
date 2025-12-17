# Firebase Authentication Setup Guide

## Quick Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project** or select existing project
3. Follow the setup wizard

### 2. Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Email/Password**
3. Enable **Email/Password** (first toggle)
4. Click **Save**

### 3. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. If you don't have a web app, click **</>** (web icon) to add one
4. Copy the configuration values:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

### 4. Get Service Account Key

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Click **Generate Key** in the dialog
4. A JSON file will download - **keep this secure!**

### 5. Create Admin User

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Add User**
5. **Important**: Add this email to your `ADMIN_EMAILS` environment variable

### 6. Configure Environment Variables

Add to your `.env.local`:

```env
# Firebase Client Config (from step 3)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin (from step 4 - convert JSON to single line)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# Admin Configuration
ADMIN_PATH=your-random-path-here
ADMIN_EMAILS=admin@example.com
```

### 7. Convert Service Account JSON to Single Line

**Option 1: Using jq (if installed)**
```bash
jq -c . path/to/serviceAccountKey.json
```

**Option 2: Manual**
- Open the JSON file
- Remove all newlines and extra spaces
- Keep it as a single line string

**Option 3: Online Tool**
- Use a JSON minifier like [jsonformatter.org](https://jsonformatter.org/json-minify)

### 8. Test the Setup

1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/[YOUR_ADMIN_PATH]`
3. You should see the login page
4. Login with the email/password from step 5

## Troubleshooting

### "Firebase is not configured"
- Check that all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Restart your dev server after adding env variables

### "Firebase Admin not initialized"
- Check that `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly
- Ensure the JSON is a valid single-line string
- Check for any syntax errors in the JSON

### "Unauthorized: Email not in admin list"
- Add your email to `ADMIN_EMAILS` in `.env.local`
- Separate multiple emails with commas
- Restart your dev server

### "Invalid email or password"
- Verify the user exists in Firebase Console → Authentication → Users
- Try resetting the password in Firebase Console
- Make sure Email/Password authentication is enabled

## Security Best Practices

1. ✅ Never commit `.env.local` to version control
2. ✅ Use strong passwords for admin accounts
3. ✅ Only add trusted emails to `ADMIN_EMAILS`
4. ✅ Keep your service account key secure
5. ✅ In production, set all env vars in your hosting platform
6. ✅ Regularly rotate service account keys
7. ✅ Enable Firebase App Check for additional security (optional)

## Production Deployment

When deploying to Vercel/Netlify/etc:

1. Add all environment variables in your platform's dashboard
2. For `FIREBASE_SERVICE_ACCOUNT_KEY`, paste the entire JSON as a single-line string
3. Make sure your production domain is allowed in Firebase Authentication settings
4. Test the admin panel after deployment
