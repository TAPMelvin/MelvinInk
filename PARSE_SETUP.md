# Parse Setup Instructions

## The "unauthorized" error occurs because Parse credentials are not configured.

### Option 1: Use Back4App (Recommended - Free Cloud Hosting)

1. Go to [Back4App.com](https://www.back4app.com/)
2. Sign up for a free account
3. Create a new app
4. Go to **App Settings > Security & Keys**
5. Copy your **Application ID** and **JavaScript Key**
6. Update `src/parseConfig.js` with your credentials:

```javascript
const PARSE_APPLICATION_ID = 'your-actual-app-id-here';
const PARSE_JAVASCRIPT_KEY = 'your-actual-javascript-key-here';
```

### Option 2: Use Environment Variables

1. Create a `.env` file in the root directory:
```
PARSE_APP_ID=your-actual-app-id
PARSE_JS_KEY=your-actual-javascript-key
PARSE_HOST_URL=https://parseapi.back4app.com/
```

2. The configuration will automatically use these values

### Option 3: Local Parse Server

If you're running Parse Server locally, update the host URL:
```javascript
const PARSE_HOST_URL = 'http://localhost:1337/parse';
```

### Current Configuration Status

The app is currently using placeholder values:
- Application ID: `your-app-id`
- JavaScript Key: `your-javascript-key`

This is why you're seeing "unauthorized" errors when trying to register or login.

### After Setting Up Parse

1. Make sure your Parse server has **User authentication enabled**
2. Restart the React development server
3. Try registering again

