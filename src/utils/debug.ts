import debug from 'debug';

// Create debug namespaces
export const log = {
  app: debug('app'),
  db: debug('app:db'),
  auth: debug('app:auth'),
  routes: debug('app:routes'),
  middleware: debug('app:middleware'),
  error: debug('app:error'),
  transaction: debug('app:transaction'),
  category: debug('app:category'),
  budget: debug('app:budget'),
  analytics: debug('app:analytics'),
};

// Enable all debug by default in development
if (process.env.NODE_ENV === 'development') {
  debug.enable('app*');
}

// Color coding for different modules
log.app.color = '1';    // red
log.db.color = '4';     // blue
log.auth.color = '3';   // yellow
log.routes.color = '2'; // green
log.error.color = '1';  // red

// Helper to log request details
export const logRequest = (req: any, __res: any, next: any) => {
  log.routes(`${req.method} ${req.path}`);
  log.routes('Headers:', req.headers);
  log.routes('Query:', req.query);
  log.routes('Params:', req.params);
  if (req.method !== 'GET') {
    log.routes('Body:', req.body);
  }
  next();
};

// Helper to log response
export const logResponse = (req: any, res: any, next: any) => {
  const oldJson = res.json;
  res.json = function(data: any) {
    log.routes(`Response for ${req.method} ${req.path}:`, data);
    return oldJson.call(this, data);
  };
  next();
};

// Performance timing
export const logPerformance = (label: string) => {
  const start = Date.now();
  return {
    end: () => {
      const duration = Date.now() - start;
      log.app(`${label} took ${duration}ms`);
      if (duration > 1000) {
        log.error(`${label} is slow (${duration}ms)`);
      }
    }
  };
};

// Memory usage monitoring
export const logMemory = () => {
  const used = process.memoryUsage();
  log.app('Memory usage:', {
    rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    external: `${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`,
  });
};