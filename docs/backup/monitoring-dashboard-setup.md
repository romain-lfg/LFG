# Monitoring Dashboard Setup Guide

This guide outlines how to set up monitoring dashboards for the LFG platform to track authentication, wallet operations, and Nillion integration.

## Prerequisites

- Access to a monitoring service (e.g., Datadog, New Relic, Grafana)
- API keys for the monitoring service
- Server access for installing monitoring agents

## Metrics to Monitor

### Authentication Metrics

- **Login Success Rate**: Percentage of successful login attempts
- **Login Failure Rate**: Percentage of failed login attempts
- **Average Login Time**: Average time to complete the login process
- **Token Verification Time**: Time taken to verify authentication tokens
- **Active User Sessions**: Number of active user sessions
- **Session Duration**: Average duration of user sessions

### Wallet Metrics

- **Wallet Creation Success Rate**: Percentage of successful wallet creations
- **Wallet Connection Success Rate**: Percentage of successful wallet connections
- **Average Wallet Creation Time**: Time taken to create a wallet
- **Average Wallet Connection Time**: Time taken to connect a wallet
- **Wallet Operations**: Number of wallet operations (create, connect, disconnect)
- **Wallet Errors**: Number of errors during wallet operations

### Nillion Metrics

- **Data Storage Success Rate**: Percentage of successful data storage operations
- **Data Retrieval Success Rate**: Percentage of successful data retrieval operations
- **Average Storage Time**: Time taken to store data in Nillion
- **Average Retrieval Time**: Time taken to retrieve data from Nillion
- **Nillion Operations**: Number of Nillion operations (store, retrieve, compute)
- **Nillion Errors**: Number of errors during Nillion operations

### API Metrics

- **Request Rate**: Number of API requests per minute
- **Response Time**: Average API response time
- **Error Rate**: Percentage of API requests that result in errors
- **Endpoint Usage**: Most frequently used API endpoints
- **Status Codes**: Distribution of HTTP status codes

### System Metrics

- **CPU Usage**: Server CPU utilization
- **Memory Usage**: Server memory utilization
- **Disk Usage**: Server disk utilization
- **Network Traffic**: Server network traffic
- **Database Connections**: Number of active database connections
- **Database Query Time**: Average database query execution time

## Dashboard Setup

### Datadog Setup

1. Install the Datadog agent on your servers:
   ```bash
   DD_API_KEY=your_api_key DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
   ```

2. Configure the agent to collect metrics:
   ```yaml
   # /etc/datadog-agent/datadog.yaml
   api_key: your_api_key
   logs_enabled: true
   apm_config:
     enabled: true
   ```

3. Create a dashboard in the Datadog UI:
   - Navigate to Dashboards > New Dashboard
   - Add widgets for each metric category
   - Configure alerts for critical metrics

### Grafana + Prometheus Setup

1. Install Prometheus:
   ```bash
   wget https://github.com/prometheus/prometheus/releases/download/v2.30.3/prometheus-2.30.3.linux-amd64.tar.gz
   tar xvfz prometheus-2.30.3.linux-amd64.tar.gz
   cd prometheus-2.30.3.linux-amd64
   ```

2. Configure Prometheus:
   ```yaml
   # prometheus.yml
   global:
     scrape_interval: 15s
   
   scrape_configs:
     - job_name: 'lfg-backend'
       static_configs:
         - targets: ['localhost:8080']
   ```

3. Install Grafana:
   ```bash
   sudo apt-get install -y software-properties-common
   sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
   wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
   sudo apt-get update
   sudo apt-get install grafana
   ```

4. Configure Grafana:
   - Add Prometheus as a data source
   - Import dashboard templates or create custom dashboards
   - Set up alerts for critical metrics

## Implementing Metrics Collection

### Backend Metrics Collection

Add the following code to your Express application:

```typescript
// backend/src/utils/metrics.ts
import { Counter, Histogram } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Initialize metrics
export const authCounter = new Counter({
  name: 'auth_operations_total',
  help: 'Total number of authentication operations',
  labelNames: ['operation', 'status'],
});

export const walletCounter = new Counter({
  name: 'wallet_operations_total',
  help: 'Total number of wallet operations',
  labelNames: ['operation', 'status'],
});

export const nillionCounter = new Counter({
  name: 'nillion_operations_total',
  help: 'Total number of Nillion operations',
  labelNames: ['operation', 'status'],
});

export const apiResponseTime = new Histogram({
  name: 'api_response_time_seconds',
  help: 'API response time in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Middleware to track API metrics
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    apiResponseTime.labels(req.method, req.path, res.statusCode.toString()).observe(duration);
  });
  
  next();
};
```

Add the middleware to your Express application:

```typescript
// backend/src/api/app.ts
import express from 'express';
import { metricsMiddleware } from '../utils/metrics';
import { register } from 'prom-client';

const app = express();

// Add metrics middleware
app.use(metricsMiddleware);

// Expose metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ... rest of your app configuration
```

### Frontend Metrics Collection

Add the following code to your Next.js application:

```typescript
// frontend/src/utils/analytics.ts
type EventType = 'auth' | 'wallet' | 'nillion' | 'error';

interface AnalyticsEvent {
  eventType: EventType;
  eventName: string;
  properties?: Record<string, any>;
}

export const trackEvent = (event: AnalyticsEvent) => {
  // Send to your analytics service
  console.log(`[Analytics] ${event.eventType}:${event.eventName}`, event.properties);
  
  // Example with Google Analytics
  if (window.gtag) {
    window.gtag('event', `${event.eventType}:${event.eventName}`, event.properties);
  }
  
  // Send to backend for aggregation
  fetch('/api/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  }).catch(error => {
    console.error('Error sending analytics event:', error);
  });
};

// Auth events
export const trackAuthEvent = (eventName: string, properties?: Record<string, any>) => {
  trackEvent({
    eventType: 'auth',
    eventName,
    properties,
  });
};

// Wallet events
export const trackWalletEvent = (eventName: string, properties?: Record<string, any>) => {
  trackEvent({
    eventType: 'wallet',
    eventName,
    properties,
  });
};

// Nillion events
export const trackNillionEvent = (eventName: string, properties?: Record<string, any>) => {
  trackEvent({
    eventType: 'nillion',
    eventName,
    properties,
  });
};

// Error events
export const trackErrorEvent = (eventName: string, properties?: Record<string, any>) => {
  trackEvent({
    eventType: 'error',
    eventName,
    properties,
  });
};
```

## Alert Configuration

Configure alerts for critical metrics:

### Authentication Alerts

- **High Login Failure Rate**: Alert when login failure rate exceeds 10% over 5 minutes
- **Slow Token Verification**: Alert when token verification time exceeds 500ms for 5 minutes

### Wallet Alerts

- **High Wallet Creation Failure Rate**: Alert when wallet creation failure rate exceeds 5% over 5 minutes
- **High Wallet Connection Failure Rate**: Alert when wallet connection failure rate exceeds 5% over 5 minutes

### Nillion Alerts

- **High Data Storage Failure Rate**: Alert when data storage failure rate exceeds 5% over 5 minutes
- **High Data Retrieval Failure Rate**: Alert when data retrieval failure rate exceeds 5% over 5 minutes

### System Alerts

- **High CPU Usage**: Alert when CPU usage exceeds 80% for 5 minutes
- **High Memory Usage**: Alert when memory usage exceeds 80% for 5 minutes
- **High Disk Usage**: Alert when disk usage exceeds 80%
- **High API Error Rate**: Alert when API error rate exceeds 5% over 5 minutes

## Conclusion

With this monitoring setup, you'll have comprehensive visibility into the performance and health of your LFG platform, particularly the authentication system, wallet operations, and Nillion integration. This will help you identify and resolve issues quickly, ensuring a smooth user experience.
