const debug = require('debug')('myapp:request');

// Custom request logger middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    // console.log('Request received at:', timestamp);
    // Log request
    debug(`${req.method} ${req.originalUrl} - ${timestamp}`);

    // Log request body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        debug('Request body:', JSON.stringify(req.body, null, 2));
    }

    // Log response time
    res.on('finish', () => {
        const duration = Date.now() - start;
        debug(`Response time: ${duration}ms - Status: ${res.statusCode}`);
    });

    next();
};

module.exports = requestLogger;
