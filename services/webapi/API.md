# WebAPI Documentation

## Обзор

WebAPI - це REST API сервер, написаний на Node.js + Express, яка зібирає метрики та інтегрується з MQTT брокером для публікації статусу сервісів.

## Endpoints

### 1. Health Check
- **URL:** `/health`
- **Метод:** GET
- **Опис:** Повертає статус здоров'я сервісу
- **Приклад відповіді:**
```json
{
  "status": "UP",
  "timestamp": "2024-02-27T10:30:00.000Z",
  "uptime": 1234.567,
  "memory": {
    "rss": 45000000,
    "heapTotal": 30000000,
    "heapUsed": 20000000,
    "external": 1000000
  },
  "mqtt": "connected"
}
```

### 2. Prometheus Metrics
- **URL:** `/metrics`
- **Метод:** GET
- **Опис:** Повертає метрики у форматі Prometheus
- **Тип контенту:** `text/plain; version=0.0.4`
- **Приклад:**
```
# HELP http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",route="/api/status",status_code="200",le="0.1"} 45
http_request_duration_seconds_bucket{method="GET",route="/api/status",status_code="200",le="0.5"} 50

# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/metrics",status_code="200"} 120
```

### 3. Service Status
- **URL:** `/api/status`
- **Метод:** GET
- **Опис:** Повертає детальний статус сервісу
- **Приклад відповіді:**
```json
{
  "service": "WebAPI",
  "status": "OK",
  "version": "1.0.0",
  "timestamp": "2024-02-27T10:30:00.000Z",
  "uptime": 1234.567,
  "environment": "production",
  "dependencies": {
    "mqtt": "connected",
    "prometheus": "connected"
  }
}
```

### 4. Get Data
- **URL:** `/api/data`
- **Метод:** GET
- **Опис:** Повертає приклад даних з інформацією про сервіси
- **Приклад відповіді:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Service 1",
      "status": "running"
    },
    {
      "id": 2,
      "name": "Service 2",
      "status": "running"
    },
    {
      "id": 3,
      "name": "MQTT Broker",
      "status": "running"
    }
  ],
  "timestamp": "2024-02-27T10:30:00.000Z",
  "responseTime": 0.123
}
```

### 5. Publish Alert
- **URL:** `/api/alert`
- **Метод:** POST
- **Опис:** Публікує alert в MQTT topic
- **Request Body:**
```json
{
  "title": "High CPU Usage",
  "severity": "warning",
  "description": "CPU usage exceeded 80%"
}
```
- **Приклад відповіді:**
```json
{
  "status": "published",
  "alert": {
    "id": "abc123def456",
    "title": "High CPU Usage",
    "severity": "warning",
    "description": "CPU usage exceeded 80%",
    "timestamp": "2024-02-27T10:30:00.000Z",
    "source": "webapi"
  }
}
```

### 6. Test Error
- **URL:** `/api/error`
- **Метод:** GET
- **Опис:** Повертає помилку 500 для тестування обробки помилок
- **Статус код:** 500
- **Приклад відповіді:**
```json
{
  "error": "Test error",
  "timestamp": "2024-02-27T10:30:00.000Z"
}
```

### 7. API Root
- **URL:** `/api`
- **Метод:** GET
- **Опис:** Повертає інформацію про API та доступні endpoints
- **Приклад відповіді:**
```json
{
  "service": "WebAPI",
  "version": "1.0.0",
  "endpoints": [
    {
      "path": "/health",
      "method": "GET",
      "description": "Health check"
    },
    {
      "path": "/metrics",
      "method": "GET",
      "description": "Prometheus metrics"
    },
    {
      "path": "/api/status",
      "method": "GET",
      "description": "Service status"
    },
    {
      "path": "/api/data",
      "method": "GET",
      "description": "Sample data"
    },
    {
      "path": "/api/alert",
      "method": "POST",
      "description": "Publish alert"
    }
  ]
}
```

## Метрики

### HTTP Request Metrics

- **http_request_duration_seconds** (Histogram)
  - Час обробки HTTP запиту в секундах
  - Labels: method, route, status_code
  - Buckets: 0.1, 0.5, 1, 2, 5 секунд

- **http_requests_total** (Counter)
  - Загальна кількість HTTP запитів
  - Labels: method, route, status_code

- **http_active_connections** (Gauge)
  - Кількість активних HTTP з'єднань
  - Labels: type

### Service Health Metrics

- **service_health_status** (Gauge)
  - Статус здоров'я сервісу (1 = healthy, 0 = unhealthy)
  - Labels: service

### Processing Metrics

- **processing_time_seconds** (Histogram)
  - Час обробки операцій
  - Labels: operation

## MQTT Integration

### Опубліковані Topics

- **service/webapi/status**
  - Статус WebAPI сервісу
  - Публікується при запуску та періодично кожні 60 секунд
  - Формат: JSON з полями service, status, timestamp, hostname

### Приклад повідомлення

```json
{
  "service": "webapi",
  "status": "online",
  "timestamp": "2024-02-27T10:30:00.000Z",
  "hostname": "docker-host"
}
```

## Codes and Status

### HTTP Status Codes

- **200 OK** - Успішний запит
- **400 Bad Request** - Помилка в запиті (наприклад, відсутні обов'язкові поля)
- **404 Not Found** - Endpoint не знайдений
- **500 Internal Server Error** - Внутрішня помилка сервера
- **503 Service Unavailable** - MQTT брокер недоступний

## Приклади використання

### cURL

```bash
# Health check
curl http://localhost:5000/health

# Метрики
curl http://localhost:5000/metrics

# Статус сервісу
curl http://localhost:5000/api/status

# Отримати дані
curl http://localhost:5000/api/data

# Опублікувати alert
curl -X POST http://localhost:5000/api/alert \
  -H "Content-Type: application/json" \
  -d '{
    "title": "High CPU Usage",
    "severity": "warning",
    "description": "CPU usage exceeded 80%"
  }'
```

### JavaScript/Fetch

```javascript
// Health check
fetch('http://localhost:5000/health')
  .then(res => res.json())
  .then(data => console.log(data))

// Отримати метрики
fetch('http://localhost:5000/metrics')
  .then(res => res.text())
  .then(data => console.log(data))

// Опублікувати alert
fetch('http://localhost:5000/api/alert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'High Memory Usage',
    severity: 'critical',
    description: 'Memory usage exceeded 90%'
  })
})
.then(res => res.json())
.then(data => console.log(data))
```

## Environment Variables

- **NODE_ENV** - Середовище (production/development)
- **PORT** - Порт прослуховування (за замовчуванням: 5000)
- **MQTT_HOST** - Хост MQTT брокера (за замовчуванням: emqx)
- **MQTT_PORT** - Порт MQTT брокера (за замовчуванням: 1883)
- **MQTT_USER** - MQTT користувач (за замовчуванням: '')
- **MQTT_PASS** - MQTT пароль (за замовчуванням: '')

## Залежності

- **express** - Web framework
- **prom-client** - Prometheus client library
- **mqtt** - MQTT client
- **morgan** - HTTP request logger
- **dotenv** - Environment variables loader
