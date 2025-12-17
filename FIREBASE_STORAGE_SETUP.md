# Firebase Storage Setup Guide

## CORS Error Fix

If you're getting CORS errors when uploading files, you need to configure Firebase Storage security rules.

### Step 1: Configure Storage Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Storage** → **Rules**
4. Update the rules to allow authenticated uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload to hero folder
    match /hero/{allPaths=**} {
      allow read: if true; // Anyone can read
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

5. Click **Publish**

### Step 2: Verify Authentication

Make sure users are authenticated before uploading. The admin panel should already handle this, but verify that:
- Users are logged in via Firebase Authentication
- The auth token is being sent with upload requests (handled automatically by Firebase SDK)

### Step 3: Test Upload

After updating the rules, try uploading a file again. The CORS error should be resolved.

## Troubleshooting

### Still getting CORS errors?

1. **Check Firebase Storage is enabled**: Go to Storage → Files and verify it's set up
2. **Verify authentication**: Make sure you're logged in as an admin user
3. **Check browser console**: Look for specific error messages
4. **Clear browser cache**: Sometimes cached rules can cause issues

### Upload fails with "Permission denied"

- Make sure the Storage rules allow authenticated writes
- Verify the user is authenticated (check Firebase Auth in console)
- Ensure the file path matches the rules pattern (`hero/*`)

