import { logger } from './logger';

/**
 * Monitoring utility for tracking application performance and errors
 */
class Monitoring {
  private static instance: Monitoring;
  private isInitialized = false;
  private metrics: Record<string, any> = {};

  private constructor() {}

  /**
   * Get the singleton instance of the Monitoring class
   */
  public static getInstance(): Monitoring {
    if (!Monitoring.instance) {
      Monitoring.instance = new Monitoring();
    }
    return Monitoring.instance;
  }

  /**
   * Initialize the monitoring system
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    logger.info('Initializing monitoring system');
    
    // Set up error handlers
    process.on('uncaughtException', (error) => {
      this.captureError(error, 'uncaughtException');
      // Give the logger time to flush
      setTimeout(() => process.exit(1), 1000);
    });

    process.on('unhandledRejection', (reason) => {
      this.captureError(reason instanceof Error ? reason : new Error(String(reason)), 'unhandledRejection');
    });

    // Initialize metrics
    this.resetMetrics();
    
    // Start periodic reporting
    setInterval(() => this.reportMetrics(), 60000); // Report every minute
    
    this.isInitialized = true;
    logger.info('Monitoring system initialized');
  }

  /**
   * Capture an error and log it
   * @param error The error to capture
   * @param source The source of the error
   */
  public captureError(error: Error, source: string = 'application'): void {
    logger.error(`Error captured from ${source}:`, error);
    
    // Increment error count
    this.metrics.errorCount++;
    
    // In a production environment, you would send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, Rollbar, etc.
      // sentry.captureException(error);
    }
  }

  /**
   * Track an API request
   * @param method The HTTP method
   * @param path The request path
   * @param statusCode The response status code
   * @param duration The request duration in milliseconds
   */
  public trackApiRequest(method: string, path: string, statusCode: number, duration: number): void {
    this.metrics.requestCount++;
    this.metrics.totalDuration += duration;
    
    if (statusCode >= 400) {
      this.metrics.errorCount++;
    }
    
    // Track specific endpoints
    const endpoint = `${method} ${path}`;
    if (!this.metrics.endpoints[endpoint]) {
      this.metrics.endpoints[endpoint] = {
        count: 0,
        totalDuration: 0,
        errorCount: 0,
      };
    }
    
    this.metrics.endpoints[endpoint].count++;
    this.metrics.endpoints[endpoint].totalDuration += duration;
    
    if (statusCode >= 400) {
      this.metrics.endpoints[endpoint].errorCount++;
    }
  }

  /**
   * Track a wallet operation
   * @param operation The operation type (create, connect)
   * @param success Whether the operation was successful
   * @param duration The operation duration in milliseconds
   */
  public trackWalletOperation(operation: 'create' | 'connect', success: boolean, duration: number): void {
    if (!this.metrics.wallet[operation]) {
      this.metrics.wallet[operation] = {
        count: 0,
        successCount: 0,
        totalDuration: 0,
      };
    }
    
    this.metrics.wallet[operation].count++;
    this.metrics.wallet[operation].totalDuration += duration;
    
    if (success) {
      this.metrics.wallet[operation].successCount++;
    }
  }

  /**
   * Track a Nillion operation
   * @param operation The operation type (store, retrieve, match)
   * @param success Whether the operation was successful
   * @param duration The operation duration in milliseconds
   */
  public trackNillionOperation(operation: 'store' | 'retrieve' | 'match', success: boolean, duration: number): void {
    if (!this.metrics.nillion[operation]) {
      this.metrics.nillion[operation] = {
        count: 0,
        successCount: 0,
        totalDuration: 0,
      };
    }
    
    this.metrics.nillion[operation].count++;
    this.metrics.nillion[operation].totalDuration += duration;
    
    if (success) {
      this.metrics.nillion[operation].successCount++;
    }
  }

  /**
   * Report metrics to the console and monitoring service
   */
  private reportMetrics(): void {
    const avgDuration = this.metrics.requestCount > 0 
      ? this.metrics.totalDuration / this.metrics.requestCount 
      : 0;
    
    logger.info('Application metrics');
    logger.debug('Metrics details', this.metrics);
    
    // In a production environment, you would send this to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Datadog, New Relic, etc.
      // datadog.sendMetrics(this.metrics);
    }
    
    // Reset metrics for the next period
    this.resetMetrics();
  }

  /**
   * Reset metrics to their initial values
   */
  private resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      totalDuration: 0,
      endpoints: {},
      wallet: {
        create: { count: 0, successCount: 0, totalDuration: 0 },
        connect: { count: 0, successCount: 0, totalDuration: 0 },
      },
      nillion: {
        store: { count: 0, successCount: 0, totalDuration: 0 },
        retrieve: { count: 0, successCount: 0, totalDuration: 0 },
        match: { count: 0, successCount: 0, totalDuration: 0 },
      },
    };
  }
}

export const monitoring = Monitoring.getInstance();
