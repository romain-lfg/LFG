# How to Extract a Privy Token for Testing

Follow these steps to extract a valid Privy token from your browser when logged into the frontend application:

## Option 1: Extract from Browser Developer Tools

1. Open your frontend application in Chrome or Firefox
2. Log in to the application using any authentication method
3. Open the browser's Developer Tools (F12 or Right-click > Inspect)
4. Go to the "Application" tab in Chrome or "Storage" tab in Firefox
5. In the left sidebar, expand "Local Storage" and select your application's domain
6. Look for an item with a key containing "privy" or "token"
7. Copy the value of this item - this is your Privy token

## Option 2: Use the Console to Extract the Token

1. Open your frontend application in any browser
2. Log in to the application
3. Open the browser's Developer Tools (F12 or Right-click > Inspect)
4. Go to the "Console" tab
5. Run one of these commands to find your token:

```javascript
// Try these commands one by one until you find the token
console.log(localStorage.getItem('privy:token'));
console.log(localStorage.getItem('privyToken'));
console.log(localStorage.getItem('token'));
// Or list all localStorage items to find the right key
Object.keys(localStorage).forEach(key => console.log(key));
```

6. Copy the token value from the console output

## Using the Token for Testing

Once you have the token, you can use it with the test script:

```bash
# Run the test with the token as a command-line argument
node scripts/test-auth-with-token.js "your-token-here"

# Or set it as an environment variable
export TEST_TOKEN="your-token-here"
node scripts/test-auth-with-token.js
```

## Important Notes

- Tokens are typically JWTs that begin with "ey..." and contain three parts separated by periods
- Tokens have an expiration time, so you may need to extract a new token if tests fail
- Never share your token with others or commit it to version control
