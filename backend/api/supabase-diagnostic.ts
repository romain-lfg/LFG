import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: Request, res: Response) {
  try {
    // Check Supabase environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    // Mask the key for security while still showing if it's set
    const supabaseKeyStatus = process.env.SUPABASE_SERVICE_ROLE_KEY 
      ? `set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...)` 
      : 'not set';

    // Return diagnostic information
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabaseConfig: {
        url: supabaseUrl,
        serviceRoleKey: supabaseKeyStatus
      },
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Supabase diagnostic error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to run Supabase diagnostic',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
