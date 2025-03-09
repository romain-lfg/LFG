// Debug endpoint to check module resolution
// This file should be placed in the /api directory to be accessible via Vercel

import { createHandler } from '../src/utils/api-handler.js';
import path from 'path';
import fs from 'fs';

/**
 * Module resolution debug handler
 * 
 * This endpoint attempts to import various modules and reports on their availability
 * to help diagnose module resolution issues in the deployment.
 */
export default createHandler(async (req, res) => {
  console.log('Debug module resolution endpoint called');
  
  // List of critical modules to check
  const modulesToCheck = [
    { name: 'nillion.controller', path: '../src/controllers/nillion.controller.js' },
    { name: 'auth.middleware', path: '../src/middleware/auth.middleware.js' },
    { name: 'auth.controller', path: '../src/controllers/auth.controller.js' },
    { name: 'user.controller', path: '../src/controllers/user.controller.js' },
    { name: 'auth.service', path: '../src/services/auth.service.js' },
    { name: 'user.service', path: '../src/services/user.service.js' }
  ];
  
  const results = {};
  
  // Check each module
  for (const module of modulesToCheck) {
    try {
      // Try to dynamically import the module
      const imported = await import(module.path);
      results[module.name] = {
        status: 'success',
        message: 'Module imported successfully',
        exports: Object.keys(imported).length > 0 ? Object.keys(imported) : 'No exports found'
      };
    } catch (error) {
      results[module.name] = {
        status: 'error',
        message: error.message,
        code: error.code,
        stack: error.stack.split('\n').slice(0, 3).join('\n')
      };
    }
  }
  
  // Check file existence
  const fileResults = {};
  const baseDir = process.cwd();
  
  for (const module of modulesToCheck) {
    try {
      const modulePath = path.resolve(baseDir, module.path);
      const exists = fs.existsSync(modulePath);
      const stats = exists ? fs.statSync(modulePath) : null;
      
      fileResults[module.name] = {
        exists,
        path: modulePath,
        size: stats ? stats.size : null,
        isFile: stats ? stats.isFile() : null,
        modified: stats ? stats.mtime.toISOString() : null
      };
    } catch (error) {
      fileResults[module.name] = {
        exists: false,
        error: error.message
      };
    }
  }
  
  // Return the module resolution status
  return res.status(200).json({
    status: 'ok',
    message: 'Module resolution status',
    moduleImports: results,
    fileSystem: fileResults,
    cwd: process.cwd(),
    nodeModulesExists: fs.existsSync(path.resolve(baseDir, 'node_modules'))
  });
});
