const express = require('express');
const prometheus = require('prom-client');
const mqtt = require('mqtt');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Prometheus Metrics Setup
// ============================================

prometheus.collectDefaultMetrics({ timeout: 5000 });

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new prometheus.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
  labelNames: ['type']
});

const serviceHealth = new prometheus.Gauge({
  name: 'service_health_status',
  help: 'Health status of the service (1 = healthy, 0 = unhealthy)',
  labelNames: ['service']
});

const processingTime = new prometheus.Histogram({
  name: 'processing_time_seconds',
  help: 'Processing time for requests',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

// ============================================
// MQTT Client Setup
// ============================================

const mqttHost = process.env.MQTT_HOST || 'emqx';
const mqttPort = process.env.MQTT_PORT || 1883;
const mqttUrl = `mqtt://${mqttHost}:${mqttPort}`;

let mqttClient = null;
let mqttConnected = false;

function initMqtt() {
  mqttClient = mqtt.connect(mqttUrl, {
    clientId: 'webapi-' + Math.random().toString(16).substr(2, 8),
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    username: process.env.MQTT_USER || '',
    password: process.env.MQTT_PASS || ''
  });

  mqttClient.on('connect', () => {
    mqttConnected = true;
    serviceHealth.set({ service: 'mqtt' }, 1);
    console.log(`✅ Connected to MQTT broker at ${mqttUrl}`);
    publishStatus('webapi', 'online');
  });

  mqttClient.on('disconnect', () => {
    mqttConnected = false;
    serviceHealth.set({ service: 'mqtt' }, 0);
    console.log('❌ Disconnected from MQTT broker');
  });

  mqttClient.on('error', (error) => {
    console.error('MQTT Error:', error.message);
    serviceHealth.set({ service: 'mqtt' }, 0);
  });
}

function publishStatus(service, status) {
  if (mqttConnected && mqttClient) {
    const message = JSON.stringify({
      service,
      status,
      timestamp: new Date().toISOString(),
      hostname: require('os').hostname()
    });
    mqttClient.publish(`service/${service}/status`, message, { qos: 1 });
  }
}

// ============================================
// Express Middleware
// ============================================

app.use(morgan('combined'));

app.use((req, res, next) => {
  const start = Date.now();
  activeConnections.inc({ type: 'http' });

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    }, duration);

    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    });

    activeConnections.dec({ type: 'http' });
  });

  next();
});

app.use(express.json());

// ============================================
// Routes
// ============================================

app.get('/health', (req, res) => {
  const health = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mqtt: mqttConnected ? 'connected' : 'disconnected'
  };

  const statusCode = health.mqtt ? 200 : 503;
  serviceHealth.set({ service: 'webapi' }, health.mqtt ? 1 : 0);

  res.status(statusCode).json(health);
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(await prometheus.register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

app.get('/api/status', (req, res) => {
  const status = {
    service: 'WebAPI',
    status: 'OK',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    dependencies: {
      mqtt: mqttConnected ? 'connected' : 'disconnected',
      prometheus: 'connected'
    }
  };

  publishStatus('webapi', 'online');
  res.json(status);
});

app.get('/api/data', (req, res) => {
  const start = Date.now();

  setTimeout(() => {
    const duration = (Date.now() - start) / 1000;
    processingTime.observe({ operation: 'fetch_data' }, duration);

    res.json({
      data: [
        { id: 1, name: 'Service 1', status: 'running' },
        { id: 2, name: 'Service 2', status: 'running' },
        { id: 3, name: 'MQTT Broker', status: mqttConnected ? 'running' : 'down' }
      ],
      timestamp: new Date().toISOString(),
      responseTime: duration
    });
  }, 100);
});

app.post('/api/alert', (req, res) => {
  const { title, severity, description } = req.body;

  if (!title || !severity) {
    return res.status(400).json({ error: 'Missing required fields: title, severity' });
  }

  const alert = {
    id: Math.random().toString(36).substr(2, 9),
    title,
    severity,
    description,
    timestamp: new Date().toISOString(),
    source: 'webapi'
  };

  if (mqttConnected && mqttClient) {
    mqttClient.publish('alerts/service-status', JSON.stringify(alert), { qos: 1 });
  }

  res.json({ status: 'published', alert });
});

app.get('/api/error', (req, res) => {
  res.status(500).json({
    error: 'Test error',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    service: 'WebAPI',
    version: '1.0.0',
    endpoints: [
      { path: '/health', method: 'GET', description: 'Health check' },
      { path: '/metrics', method: 'GET', description: 'Prometheus metrics' },
      { path: '/api/status', method: 'GET', description: 'Service status' },
      { path: '/api/data', method: 'GET', description: 'Sample data' },
      { path: '/api/alert', method: 'POST', description: 'Publish alert' }
    ]
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ============================================
// Server Startup
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 WebAPI Server started on port ${PORT}`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
  console.log(`${'-'.repeat(50)}`);

  initMqtt();

  setInterval(() => {
    publishStatus('webapi', 'online');
  }, 60000);

  serviceHealth.set({ service: 'webapi' }, 1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (mqttClient) {
    mqttClient.end();
  }
  process.exit(0);
});

module.exports = app;
