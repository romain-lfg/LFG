import express from 'express';
import cors from 'cors';
import { createBounty, getBountyList, clearBounties, matchBountiesUser } from './lib/nillion/index.js';
// Create Express app
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// Initialize Nillion only once
let nillionInitialized = false;
let initializationPromise = null;
let lastInitAttempt = 0;
const INIT_RETRY_INTERVAL = 30000; // 30 seconds
// Helper to check memory usage
function logMemoryUsage(tag) {
    if (process.env.NODE_ENV !== 'production')
        return;
    const used = process.memoryUsage();
    console.log(`[${Date.now()}] Memory usage (${tag}):\n` +
        `  RSS: ${Math.round(used.rss / 1024 / 1024)}MB\n` +
        `  Heap: ${Math.round(used.heapUsed / 1024 / 1024)}/${Math.round(used.heapTotal / 1024 / 1024)}MB`);
}
// Initialize Nillion
async function initializeNillion() {
    const now = Date.now();
    if (nillionInitialized) {
        return initializationPromise;
    }
    // Allow retrying initialization more frequently
    if (now - lastInitAttempt < 5000) { // 5 seconds
        return initializationPromise;
    }
    // Log initial memory state
    logMemoryUsage('before-init');
    lastInitAttempt = now;
    console.log(`[${now}] Starting Nillion initialization...`);
    initializationPromise = (async () => {
        const startTime = now;
        try {
            // Ensure imports are loaded
            console.log(`[${now}] Checking Nillion imports...`);
            const nillionFunctions = { createBounty, getBountyList, clearBounties, matchBountiesUser };
            console.log(`[${now}] Available Nillion functions:`, Object.keys(nillionFunctions));
            // Test each function to ensure it's properly loaded
            for (const [name, fn] of Object.entries(nillionFunctions)) {
                if (typeof fn !== 'function') {
                    throw new Error(`${name} is not a function`);
                }
            }
            nillionInitialized = true;
            console.log(`[${now}] Nillion initialization complete after ${Date.now() - startTime}ms`);
            // Log memory usage after initialization
            logMemoryUsage('after-init');
            // Suggest garbage collection
            if (global.gc) {
                global.gc();
                logMemoryUsage('after-gc');
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to initialize Nillion';
            console.error(`[${now}] Failed to initialize Nillion after ${Date.now() - startTime}ms:`, errorMsg);
            nillionInitialized = false;
            throw new Error(errorMsg);
        }
    })();
    return initializationPromise;
}
// Initial initialization attempt
initializeNillion();
async function waitForNillionInit() {
    try {
        await initializeNillion();
    }
    catch (error) {
        console.error('Error waiting for Nillion:', error);
        throw error;
    }
}
// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
// Export the Express app for testing
export { app };
// Export a request handler function for Vercel
export default async function handler(req, res) {
    const requestId = Math.random().toString(36).substring(7);
    const startTime = Date.now();
    console.log(`[${startTime}][${requestId}] Handling ${req.method} request to ${req.url}`);
    try {
        // Quick responses for health check and favicon
        if (req.url === '/health' || req.url === '/favicon.ico') {
            return res.json({ status: 'ok', time: Date.now() });
        }
        // Set a shorter timeout for initialization
        const timeout = 5000; // 5 seconds
        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                const timeoutTime = Date.now();
                console.error(`[${timeoutTime}][${requestId}] Handler timeout after ${timeoutTime - startTime}ms`);
                reject(new Error(`Request timeout after ${timeoutTime - startTime}ms`));
            }, timeout);
        });
        try {
            // Handle the request with timeout
            const result = await Promise.race([
                (async () => {
                    try {
                        // Wait for Nillion to be ready
                        const initStart = Date.now();
                        await waitForNillionInit();
                        console.log(`[${Date.now()}][${requestId}] Nillion init took ${Date.now() - initStart}ms`);
                        // Handle the request
                        return new Promise((resolve, reject) => {
                            const requestStart = Date.now();
                            app(req, res, (err) => {
                                if (err) {
                                    const errTime = Date.now();
                                    console.error(`[${errTime}][${requestId}] Express error after ${errTime - requestStart}ms:`, err);
                                    return reject(err);
                                }
                                const endTime = Date.now();
                                console.log(`[${endTime}][${requestId}] Request completed in ${endTime - startTime}ms`);
                                resolve(undefined);
                            });
                        });
                    }
                    catch (error) {
                        const errTime = Date.now();
                        console.error(`[${errTime}][${requestId}] Request failed after ${errTime - startTime}ms:`, error);
                        throw error;
                    }
                })(),
                timeoutPromise
            ]);
            // Clear timeout if request completed successfully
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            return result;
        }
        catch (error) {
            // Make sure to clear timeout even if there was an error
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            throw error;
        }
    }
    catch (error) {
        console.error('Handler error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error', details: errorMessage });
        }
    }
}
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Create a bounty
app.post('/bounties', async (req, res) => {
    const startTime = Date.now();
    logMemoryUsage('before-create-bounty');
    try {
        await createBounty(req.body);
        const endTime = Date.now();
        console.log(`[${endTime}] createBounty completed in ${endTime - startTime}ms`);
        logMemoryUsage('after-create-bounty');
        res.status(201).json({ message: 'Bounty created successfully' });
        // Suggest garbage collection after response
        if (global.gc) {
            global.gc();
            logMemoryUsage('after-gc');
        }
    }
    catch (error) {
        const errTime = Date.now();
        console.error(`[${errTime}] Failed to create bounty after ${errTime - startTime}ms:`, error);
        res.status(500).json({
            message: 'Failed to create bounty',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get all bounties
app.get('/bounties', async (req, res) => {
    const startTime = Date.now();
    try {
        const bounties = await getBountyList();
        const endTime = Date.now();
        console.log(`[${endTime}] getBountyList completed in ${endTime - startTime}ms`);
        res.json(bounties);
    }
    catch (error) {
        const errTime = Date.now();
        console.error(`[${errTime}] Failed to get bounties after ${errTime - startTime}ms:`, error);
        res.status(500).json({
            message: 'Failed to get bounties',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get bounties matching a user
app.get('/bounties/match/:userId', async (req, res) => {
    const startTime = Date.now();
    try {
        const { userId } = req.params;
        const matches = await matchBountiesUser(userId);
        const endTime = Date.now();
        console.log(`[${endTime}] matchBountiesUser completed in ${endTime - startTime}ms`);
        res.json(matches);
    }
    catch (error) {
        const errTime = Date.now();
        console.error(`[${errTime}] Failed to get matching bounties after ${errTime - startTime}ms:`, error);
        res.status(500).json({
            message: 'Failed to get matching bounties',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Clear all bounties (for testing)
app.post('/bounties/clear', async (req, res) => {
    const startTime = Date.now();
    try {
        await clearBounties();
        const endTime = Date.now();
        console.log(`[${endTime}] clearBounties completed in ${endTime - startTime}ms`);
        res.json({ message: 'All bounties cleared' });
    }
    catch (error) {
        const errTime = Date.now();
        console.error(`[${errTime}] Failed to clear bounties after ${errTime - startTime}ms:`, error);
        res.status(500).json({
            message: 'Failed to clear bounties',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
