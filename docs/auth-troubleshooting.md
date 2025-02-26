# Authentication Troubleshooting Guide

This guide provides solutions for common issues that may arise with the LFG authentication system.

## Backend Issues

### Token Verification Failures

#### Symptoms
- 401 Unauthorized responses from API endpoints
- Error message: "Unauthorized: Token verification failed"
- Error message: "Unauthorized: Invalid token"

#### Possible Causes
1. **Incorrect Privy Public Key**: The public key used for verification doesn't match the one from Privy.
2. **Malformed Token**: The token is not in the correct format.
3. **Expired Token**: The token has expired.
4. **Wrong Verification Method**: The token verification method is not being called correctly.

#### Solutions
1. **Verify Environment Variables**:
   ```bash
   node scripts/verify-env.js
   ```
   Ensure that `PRIVY_PUBLIC_KEY` is set correctly.

2. **Check Token Format**:
   The token should be a valid JWT. You can decode it at [jwt.io](https://jwt.io/) to check its structure.

3. **Check Token Expiration**:
   Decode the token and check the `exp` claim to see if it has expired.

4. **Review Verification Code**:
   Ensure that the token verification is being called correctly:
   ```typescript
   // Correct method
   const verifiedClaims = await privyClient.verifyAuthToken(token, privyPublicKey);
   
   // NOT like this (common mistake)
   const verifiedClaims = await privyClient.verifyAuthToken(token, { verificationKey: privyPublicKey });
   ```

5. **Enable Debug Logging**:
   Add more detailed logging to the authentication middleware:
   ```typescript
   console.log('Token:', token.substring(0, 10) + '...');
   console.log('Public Key:', privyPublicKey.substring(0, 10) + '...');
   ```

### Missing User Information

#### Symptoms
- User object is incomplete in API responses
- Missing wallet address or email in user profile

#### Possible Causes
1. **User Data Not Synced**: The user data hasn't been synced with the database.
2. **Database Connection Issues**: Connection to Supabase is failing.
3. **Incorrect User ID**: The user ID from the token doesn't match the database.

#### Solutions
1. **Trigger User Sync**:
   Make a request to the user sync endpoint:
   ```bash
   curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{}' http://localhost:3001/api/users/sync
   ```

2. **Check Supabase Connection**:
   Verify that the Supabase URL and service role key are correct:
   ```bash
   node scripts/verify-env.js
   ```

3. **Check Database Records**:
   Query the database directly to check if the user exists:
   ```sql
   SELECT * FROM users WHERE id = 'user-id-from-token';
   ```

4. **Inspect User Service**:
   Review the user service implementation to ensure it's correctly handling user data.

### CORS Issues

#### Symptoms
- Browser console errors about CORS
- API requests failing with CORS errors

#### Possible Causes
1. **Incorrect CORS Configuration**: The CORS middleware is not configured correctly.
2. **Missing Origin Header**: The frontend is not sending the Origin header.
3. **Wrong Frontend URL**: The `FRONTEND_URL` environment variable is incorrect.

#### Solutions
1. **Check CORS Configuration**:
   Review the CORS middleware setup in your Express app:
   ```typescript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true,
   }));
   ```

2. **Verify Frontend URL**:
   Ensure that the `FRONTEND_URL` environment variable matches the actual frontend URL:
   ```bash
   echo $FRONTEND_URL
   ```

3. **Allow Multiple Origins**:
   If you need to support multiple frontend origins:
   ```typescript
   const allowedOrigins = [
     'http://localhost:3000',
     'https://your-production-url.com',
   ];
   
   app.use(cors({
     origin: function(origin, callback) {
       if (!origin || allowedOrigins.indexOf(origin) !== -1) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
     credentials: true,
   }));
   ```

4. **Test with Curl**:
   Test the API without CORS restrictions using curl:
   ```bash
   curl -H "Origin: http://localhost:3000" -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/users/profile
   ```

## Frontend Issues

### Authentication State Not Persisting

#### Symptoms
- User is logged out after page refresh
- Need to log in again after navigating between pages

#### Possible Causes
1. **Missing Persistence**: Privy is not configured to persist authentication state.
2. **Cookie Issues**: Cookies are being blocked or not set correctly.
3. **Storage Issues**: Local storage or session storage is being cleared.

#### Solutions
1. **Configure Privy for Persistence**:
   Update the Privy configuration to enable persistence:
   ```typescript
   <PrivyProviderBase
     appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
     config={{
       loginMethods: ['email', 'google', 'wallet'],
       appearance: {
         theme: 'light',
         accentColor: '#4F46E5',
       },
       embeddedWallets: {
         createOnLogin: true,
       },
       // Enable persistence
       persistence: 'session',
     }}
   >
   ```

2. **Check Browser Storage**:
   Open the browser's developer tools and check:
   - Application > Cookies
   - Application > Local Storage
   - Application > Session Storage

3. **Test in Incognito Mode**:
   Test in an incognito/private browsing window to rule out browser extensions.

4. **Implement Custom Persistence**:
   If needed, implement custom persistence using local storage:
   ```typescript
   // In AuthContext.tsx
   useEffect(() => {
     // Save authentication state to local storage
     if (authenticated && privyUser) {
       localStorage.setItem('isAuthenticated', 'true');
       localStorage.setItem('userId', privyUser.id);
     } else {
       localStorage.removeItem('isAuthenticated');
       localStorage.removeItem('userId');
     }
   }, [authenticated, privyUser]);
   ```

### Login Not Working

#### Symptoms
- Login button doesn't do anything
- Login modal doesn't appear
- Login process starts but never completes

#### Possible Causes
1. **Incorrect Privy App ID**: The Privy App ID is incorrect.
2. **JavaScript Errors**: There are JavaScript errors preventing the login flow.
3. **Network Issues**: Network requests to Privy are failing.
4. **Popup Blockers**: Popup blockers are preventing the login window.

#### Solutions
1. **Verify Privy App ID**:
   Check that the Privy App ID is correct in your environment variables:
   ```
   NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
   ```

2. **Check Browser Console**:
   Open the browser's developer tools and check for errors in the console.

3. **Inspect Network Requests**:
   Check the network tab in the developer tools to see if requests to Privy are succeeding.

4. **Disable Popup Blockers**:
   Temporarily disable popup blockers and try again.

5. **Try Different Login Methods**:
   If one login method isn't working, try another (e.g., email instead of wallet).

6. **Update Privy SDK**:
   Ensure you're using the latest version of the Privy SDK:
   ```bash
   npm update @privy-io/react-auth
   ```

### Protected Routes Not Working

#### Symptoms
- Can access protected routes without authentication
- Redirect loop when trying to access protected routes
- Blank page on protected routes

#### Possible Causes
1. **Incorrect Route Protection**: The route protection logic is flawed.
2. **Authentication State Timing**: The authentication state is not ready when the route check happens.
3. **Redirect Logic**: The redirect logic is causing an infinite loop.

#### Solutions
1. **Review Protected Route Component**:
   Ensure the ProtectedRoute component is implemented correctly:
   ```tsx
   export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
     const { isAuthenticated, loading } = useAuth();
     const router = useRouter();
     
     useEffect(() => {
       if (!loading && !isAuthenticated) {
         router.push('/');
       }
     }, [isAuthenticated, loading, router]);
     
     if (loading) {
       return <div>Loading...</div>;
     }
     
     return isAuthenticated ? <>{children}</> : null;
   };
   ```

2. **Add Loading State**:
   Ensure you're handling the loading state correctly:
   ```tsx
   if (loading) {
     return <div>Loading authentication state...</div>;
   }
   ```

3. **Check for Redirect Loops**:
   Add console logs to track the redirect flow:
   ```tsx
   useEffect(() => {
     console.log('Auth state:', { isAuthenticated, loading });
     if (!loading && !isAuthenticated) {
       console.log('Redirecting to home page');
       router.push('/');
     }
   }, [isAuthenticated, loading, router]);
   ```

4. **Implement Server-Side Authentication Check**:
   For Next.js applications, add server-side authentication checks:
   ```tsx
   export const getServerSideProps: GetServerSideProps = async (context) => {
     // Check for authentication cookie or token
     const { req } = context;
     const token = req.cookies.authToken;
     
     if (!token) {
       return {
         redirect: {
           destination: '/',
           permanent: false,
         },
       };
     }
     
     return {
       props: {},
     };
   };
   ```

## Wallet Integration Issues

### Wallet Connection Failures

#### Symptoms
- Cannot connect wallet
- Wallet connection dialog appears but doesn't complete
- Error messages related to wallet connection

#### Possible Causes
1. **Unsupported Wallet**: The wallet is not supported by Privy.
2. **Browser Compatibility**: The browser doesn't support the wallet connection method.
3. **Wallet Extension Issues**: The wallet extension is not working correctly.
4. **Network Mismatch**: The wallet is connected to a different network than expected.

#### Solutions
1. **Check Supported Wallets**:
   Verify that the wallet is supported by Privy:
   ```typescript
   <PrivyProviderBase
     appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
     config={{
       loginMethods: ['email', 'google', 'wallet'],
       supportedWallets: ['metamask', 'walletconnect', 'coinbase_wallet'],
     }}
   >
   ```

2. **Try Different Browsers**:
   Test in different browsers to rule out browser-specific issues.

3. **Update Wallet Extensions**:
   Ensure wallet extensions are up to date.

4. **Check Network**:
   Verify that the wallet is connected to the expected network (e.g., Ethereum Mainnet, Polygon, etc.).

5. **Enable Detailed Logging**:
   Add more detailed logging for wallet connection:
   ```typescript
   const { connectWallet } = usePrivy();
   
   const handleWalletConnect = async () => {
     try {
       console.log('Connecting wallet...');
       await connectWallet();
       console.log('Wallet connected successfully');
     } catch (error) {
       console.error('Wallet connection error:', error);
     }
   };
   ```

### Wallet Address Not Syncing

#### Symptoms
- Wallet is connected but address is not showing in the user profile
- Wallet address is not being saved to the database

#### Possible Causes
1. **User Sync Issue**: The user sync process is not capturing the wallet address.
2. **Permission Issue**: The user didn't grant permission to access the wallet address.
3. **Data Format Issue**: The wallet address is in an unexpected format.

#### Solutions
1. **Check User Sync Logic**:
   Review the user sync implementation:
   ```typescript
   const syncUserData = async () => {
     if (!authenticated || !privyUser) return;
     
     try {
       const token = await getAccessToken();
       
       const userData = {
         walletAddress: privyUser.wallet?.address,
         email: privyUser.email?.address,
         metadata: {
           name: privyUser.name,
         },
       };
       
       console.log('Syncing user data:', userData);
       
       const response = await axios.post(
         `${process.env.NEXT_PUBLIC_API_URL}/api/users/sync`,
         userData,
         {
           headers: {
             Authorization: `Bearer ${token}`,
           },
         }
       );
       
       console.log('Sync response:', response.data);
       
       setUser(response.data.user);
     } catch (error) {
       console.error('Error syncing user data:', error);
     }
   };
   ```

2. **Manually Trigger Sync**:
   Add a button to manually trigger the user sync:
   ```tsx
   <button onClick={syncUserData}>Sync User Data</button>
   ```

3. **Check Privy User Object**:
   Log the Privy user object to see if it contains the wallet address:
   ```typescript
   console.log('Privy user:', privyUser);
   ```

4. **Check Database**:
   Verify that the database schema supports storing wallet addresses:
   ```sql
   SELECT * FROM users WHERE id = 'user-id';
   ```

## General Troubleshooting

### Debugging Tools

1. **Browser Developer Tools**:
   - Console: Check for JavaScript errors
   - Network: Monitor API requests and responses
   - Application: Inspect cookies, local storage, and session storage

2. **API Testing Tools**:
   - Postman: Test API endpoints without browser restrictions
   - Curl: Command-line tool for API testing

3. **Logging**:
   - Backend: Add detailed logging with Winston or similar
   - Frontend: Use console.log for debugging

4. **Environment Variables**:
   - Use the verify-env.js script to check environment variables
   - Create separate .env files for different environments

### Common Debugging Steps

1. **Clear Browser Cache**:
   Clear the browser cache and cookies to rule out stale data.

2. **Restart Servers**:
   Restart both frontend and backend servers to ensure they're using the latest code.

3. **Check Network Connectivity**:
   Ensure that the frontend can reach the backend and that the backend can reach external services.

4. **Verify Dependencies**:
   Ensure all dependencies are installed and up to date:
   ```bash
   npm install
   npm outdated
   ```

5. **Check for Typos**:
   Common issues include typos in environment variable names, API endpoints, and import paths.

6. **Isolate the Issue**:
   Create minimal test cases to isolate the issue from the rest of the application.

7. **Review Documentation**:
   Check the Privy documentation for any changes or known issues.

### Getting Help

If you're still experiencing issues after trying the solutions in this guide, consider the following resources:

1. **Privy Documentation**:
   [Privy Documentation](https://docs.privy.io/)

2. **Privy Discord**:
   Join the Privy Discord community for support.

3. **GitHub Issues**:
   Check the GitHub repository for similar issues or open a new issue.

4. **Stack Overflow**:
   Search for similar questions or ask a new question with the appropriate tags.

5. **Contact Support**:
   Reach out to Privy support for issues specific to their service.
