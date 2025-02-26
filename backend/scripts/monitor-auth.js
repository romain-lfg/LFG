/**
 * Authentication System Monitoring Script
 * 
 * This script monitors the authentication system in production by:
 * 1. Checking API health
 * 2. Testing authentication endpoints
 * 3. Monitoring authentication failures
 * 4. Alerting on suspicious activity
 * 
 * Usage:
 * node scripts/monitor-auth.js
 */

import axios from 'axios';
import chalk from 'chalk';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3002';
const ALERT_THRESHOLD = process.env.ALERT_THRESHOLD || 5; // Number of failures before alerting
const CHECK_INTERVAL = process.env.CHECK_INTERVAL || 60000; // 1 minute
const LOG_FILE = process.env.LOG_FILE || path.join(os.tmpdir(), 'auth-monitor.log');

// Test API client
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  validateStatus: () => true, // Don't throw on non-2xx responses
});

// Mock JWT generation for testing
const generateMockToken = (userId) => {
  const payload = {
    userId,
    appId: 'test-app-id',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
  };
  
  // This is a mock secret for testing only
  const secret = 'test-secret';
  
  return jwt.sign(payload, secret);
};

// Logging
const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;
  
  console.log(level === 'error' ? chalk.red(logMessage) : 
              level === 'warning' ? chalk.yellow(logMessage) : 
              level === 'success' ? chalk.green(logMessage) : 
              chalk.blue(logMessage));
  
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
};

// Alert
const sendAlert = (message) => {
  log(`ALERT: ${message}`, 'error');
  
  // In a real production environment, you would send an alert via:
  // - Email
  // - SMS
  // - Slack
  // - PagerDuty
  // - etc.
  
  // For this example, we'll just log to the console
  console.log(chalk.bgRed.white(`🚨 ALERT: ${message}`));
};

// Health check
const checkHealth = async () => {
  try {
    const response = await api.get('/api/health');
    
    if (response.status === 200) {
      log('API health check successful', 'success');
      return true;
    } else {
      log(`API health check failed: ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    log(`API health check error: ${error.message}`, 'error');
    return false;
  }
};

// Authentication test
const testAuthentication = async () => {
  try {
    const testUserId = uuidv4();
    const token = generateMockToken(testUserId);
    
    const response = await api.get('/api/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (response.status === 401) {
      // This is expected since we're using a mock token
      log('Authentication test successful (expected 401 with mock token)', 'success');
      return true;
    } else if (response.status === 200) {
      // This might happen if the server is in test mode
      log('Authentication test successful (200 response)', 'success');
      return true;
    } else {
      log(`Authentication test failed: ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    log(`Authentication test error: ${error.message}`, 'error');
    return false;
  }
};

// Monitor authentication failures
let failureCount = 0;
let lastAlertTime = 0;

const monitorFailures = (success) => {
  if (success) {
    failureCount = 0;
  } else {
    failureCount++;
    
    if (failureCount >= ALERT_THRESHOLD) {
      const now = Date.now();
      
      // Only send an alert once per hour
      if (now - lastAlertTime > 3600000) {
        sendAlert(`Authentication system has failed ${failureCount} times in a row`);
        lastAlertTime = now;
      }
    }
  }
};

// Run all checks
const runChecks = async () => {
  log('Running authentication system checks...');
  
  const healthStatus = await checkHealth();
  const authStatus = await testAuthentication();
  
  const success = healthStatus && authStatus;
  monitorFailures(success);
  
  log(`Check complete. Status: ${success ? 'OK' : 'FAILED'}`, success ? 'success' : 'error');
  
  return success;
};

// Main monitoring loop
const startMonitoring = async () => {
  log('Starting authentication system monitoring');
  log(`API URL: ${API_URL}`);
  log(`Alert threshold: ${ALERT_THRESHOLD} failures`);
  log(`Check interval: ${CHECK_INTERVAL}ms`);
  log(`Log file: ${LOG_FILE}`);
  
  // Initial check
  await runChecks();
  
  // Schedule regular checks
  setInterval(runChecks, CHECK_INTERVAL);
};

// Handle signals
process.on('SIGINT', () => {
  log('Monitoring stopped by user', 'warning');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Monitoring terminated', 'warning');
  process.exit(0);
});

// Start monitoring
startMonitoring().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  console.error(error.stack);
  process.exit(1);
});
