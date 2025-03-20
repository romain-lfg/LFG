import { test, expect, Page } from '@playwright/test';

test.describe('Authentication Flow', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should allow a user to sign in with email', async () => {
    // Click the sign in button
    await page.click('button:has-text("Sign In")');
    
    // Wait for the Privy dialog to appear
    await page.waitForSelector('[data-testid="privy-dialog"]');
    
    // Click the email option
    await page.click('button:has-text("Continue with Email")');
    
    // Fill in the email
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Continue")');
    
    // Verify we see the verification code screen
    await expect(page.locator('text=Verification code')).toBeVisible();
    
    // Note: In a real test, we would need to intercept the email or use a test account
    // For this example, we'll stop here
  });

  test('should allow a user to connect a wallet', async () => {
    // Sign in first (assuming we have a test account)
    await signInWithTestAccount(page);
    
    // Navigate to profile page
    await page.click('a:has-text("Profile")');
    
    // Click on wallet management
    await page.click('button:has-text("Manage Wallets")');
    
    // Click connect wallet
    await page.click('button:has-text("Connect Existing Wallet")');
    
    // Wait for wallet selection dialog
    await expect(page.locator('text=Select a wallet')).toBeVisible();
    
    // Note: In a real test, we would need to mock the wallet provider
    // For this example, we'll stop here
  });

  test('should allow a user to create a new wallet', async () => {
    // Sign in first (assuming we have a test account)
    await signInWithTestAccount(page);
    
    // Navigate to profile page
    await page.click('a:has-text("Profile")');
    
    // Click on wallet management
    await page.click('button:has-text("Manage Wallets")');
    
    // Click create wallet
    await page.click('button:has-text("Create New Wallet")');
    
    // Wait for loading state
    await expect(page.locator('text=Processing wallet operation')).toBeVisible();
    
    // Wait for success message
    await expect(page.locator('text=Your wallet has been created successfully')).toBeVisible({ timeout: 30000 });
    
    // Verify the wallet is displayed in the list
    await expect(page.locator('text=0x')).toBeVisible();
  });

  test('should display user profile information correctly', async () => {
    // Sign in first (assuming we have a test account)
    await signInWithTestAccount(page);
    
    // Navigate to profile page
    await page.click('a:has-text("Profile")');
    
    // Verify profile information is displayed
    await expect(page.locator('[data-testid="profile-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-email"]')).toBeVisible();
    
    // If the user has a wallet, verify it's displayed
    await expect(page.locator('[data-testid="wallet-address"]')).toBeVisible();
  });

  test('should allow a user to sign out', async () => {
    // Sign in first (assuming we have a test account)
    await signInWithTestAccount(page);
    
    // Click the sign out button
    await page.click('button:has-text("Sign Out")');
    
    // Verify we're signed out by checking for the sign in button
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('should protect routes that require authentication', async () => {
    // Try to access a protected route without authentication
    await page.goto('http://localhost:3000/dashboard');
    
    // Verify we're redirected to the login page
    await expect(page.url()).toContain('/login');
    
    // Sign in
    await signInWithTestAccount(page);
    
    // Try to access the protected route again
    await page.goto('http://localhost:3000/dashboard');
    
    // Verify we can access it now
    await expect(page.url()).toContain('/dashboard');
  });
});

// Helper function to sign in with a test account
async function signInWithTestAccount(page: Page) {
  // Click the sign in button
  await page.click('button:has-text("Sign In")');
  
  // Wait for the Privy dialog to appear
  await page.waitForSelector('[data-testid="privy-dialog"]');
  
  // Click the email option
  await page.click('button:has-text("Continue with Email")');
  
  // Fill in the test email
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button:has-text("Continue")');
  
  // In a real test environment, we would need to:
  // 1. Either intercept the verification code email
  // 2. Or use a test account with a known verification code
  // 3. Or mock the Privy authentication flow
  
  // For this example, we'll simulate a successful login
  // This would need to be replaced with actual code in a real test
  await page.evaluate(() => {
    localStorage.setItem('privy:token', 'mock-token');
    localStorage.setItem('privy:user', JSON.stringify({
      id: 'test-user-id',
      email: { address: 'test@example.com', verified: true },
      wallet: { address: '0x1234567890abcdef1234567890abcdef12345678' },
    }));
  });
  
  // Reload the page to apply the authentication
  await page.reload();
  
  // Wait for the authenticated state
  await expect(page.locator('text=Profile')).toBeVisible();
}
