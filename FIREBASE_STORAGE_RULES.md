# Firebase Storage Security Rules

## Required Rules for QuickNav Photo Uploads

Your Firebase Storage security rules need to allow authenticated users to upload files to the `quicknav/` path. Here's the recommended security rules configuration:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read/write hero files
    match /hero/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write quicknav files (photos and certificates)
    match /quicknav/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## How to Update Firebase Storage Rules

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`sonnysarcia-portfolio`)
3. Navigate to **Storage** in the left sidebar
4. Click on the **Rules** tab
5. Update the rules with the configuration above
6. Click **Publish** to save the changes

## Alternative: Allow All Authenticated Users (Less Restrictive)

If you want to allow authenticated users to upload to any path:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Note:** This is less secure but simpler. Use the first configuration for better security.
