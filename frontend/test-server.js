import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

// Serve static files from the public directory
app.use(express.static(join(__dirname, 'public')));

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Test frontend server running on port ${port}`);
  console.log(`Open http://localhost:${port}/test-auth.html in your browser to test the authentication flow`);
});
