// Script to verify the Privy public key format and test token verification
const dotenv = require('dotenv');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config({ path: './backend/.env.staging' });

// Get environment variables
const privyAppId = process.env.PRIVY_APP_ID;
const privyPublicKey = process.env.PRIVY_PUBLIC_KEY;

// Function to analyze the public key format
function analyzePublicKey(key) {
  console.log('\n=== PRIVY PUBLIC KEY ANALYSIS ===');
  console.log(`Key length: ${key.length}`);
  console.log(`Key starts with: ${key.substring(0, 20)}...`);
  console.log(`Key ends with: ...${key.substring(key.length - 20)}`);
  console.log(`Contains "BEGIN PUBLIC KEY": ${key.includes('BEGIN PUBLIC KEY')}`);
  console.log(`Contains "END PUBLIC KEY": ${key.includes('END PUBLIC KEY')}`);
  console.log(`Contains newlines: ${key.includes('\n')}`);
  console.log(`Contains spaces: ${key.includes(' ')}`);
  console.log(`Contains carriage returns: ${key.includes('\r')}`);
  
  // Check if it's base64 encoded
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  console.log(`Appears to be valid base64: ${base64Regex.test(key)}`);
  
  // Check if it's a PEM format or raw key
  if (key.startsWith('-----BEGIN')) {
    console.log('Key format: PEM (with headers/footers)');
  } else if (base64Regex.test(key)) {
    console.log('Key format: Raw base64-encoded key (no headers/footers)');
  } else {
    console.log('Key format: Unknown');
  }
}

// Function to parse and analyze a JWT token
function analyzeToken(token) {
  console.log('\n=== TOKEN ANALYSIS ===');
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format! Expected 3 parts separated by dots.');
      return;
    }
    
    const [headerB64, payloadB64] = parts;
    
    // Decode header
    const headerStr = Buffer.from(headerB64, 'base64').toString();
    const header = JSON.parse(headerStr);
    console.log('Token header:', JSON.stringify(header, null, 2));
    
    // Decode payload
    const payloadStr = Buffer.from(payloadB64, 'base64').toString();
    const payload = JSON.parse(payloadStr);
    console.log('Token payload:', JSON.stringify(payload, null, 2));
    
    // Check expiration
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      console.log(`Token expires at: ${expDate.toISOString()}`);
      console.log(`Current time: ${now.toISOString()}`);
      console.log(`Token is ${expDate > now ? 'not expired' : 'EXPIRED'}`);
    }
    
    return { header, payload };
  } catch (error) {
    console.error('Error analyzing token:', error);
  }
}

// Main function
function main() {
  console.log('=== PRIVY VERIFICATION KEY CHECKER ===');
  console.log(`PRIVY_APP_ID: ${privyAppId ? '✅ Set' : '❌ Not set'}`);
  console.log(`PRIVY_PUBLIC_KEY: ${privyPublicKey ? '✅ Set' : '❌ Not set'}`);
  
  if (privyPublicKey) {
    analyzePublicKey(privyPublicKey);
  } else {
    console.error('❌ PRIVY_PUBLIC_KEY is not set in the environment variables!');
    process.exit(1);
  }
  
  // Check if a token was provided as a command-line argument
  const token = process.argv[2];
  if (token) {
    analyzeToken(token);
  } else {
    console.log('\n⚠️ No token provided for analysis. Run with: node verify-privy-key.cjs <token>');
  }
}

// Execute the main function
main();
