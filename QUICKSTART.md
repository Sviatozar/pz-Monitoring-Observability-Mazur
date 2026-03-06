# Шпаргалка для швидкого старту

## 🚀 Швидкий старт (5 хвилин)


### 1. Встановлюємо залежності WebAPI
```bash
cd services/webapi
npm install
cd ../..
```

### 2. Запускаємо контейнери
```bash
docker-compose up -d
```

Все повинно мати статус `Up (healthy)` або `Up`.

## 📊 Відкриваємо інструменти

| Що | URL | Логін |
|----|-----|-------|
| Фронтенд | http://localhost | - |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3000 | admin / admin123 |
| Alertmanager | http://localhost:9093 | - |
| EMQX | http://localhost:18083 | admin / public |
| WebAPI | http://localhost:5000/api | - |

## ✅ Перевіряємо, що все працює

### 1. Перевірити здоров'я сервісів
```bash
# WebAPI
curl http://localhost:5000/health

# Prometheus
curl http://localhost:9090/-/healthy

# Grafana
curl http://localhost:3000/api/health
```

### 2. Перевірити метрики Prometheus
Перейти на http://localhost:9090/targets - все повинно бути зеленим

### 3. Перевірити дашборд в Grafana
- Перейти на http://localhost:3000
- Увійти: admin / admin123
- Обрати "Monitoring Dashboard"

## 🧪 Тестування алертингу

### 1. Зупинити WebAPI (щоб запустити alert)
```bash
docker-compose stop webapi
```

### 2. Перевірити alert у Prometheus
Перейти на http://localhost:9090/alerts - повинен бути red alert

### 3. Перевірити Alertmanager
Перейти на http://localhost:9093 - повинен бути alert

### 4. Запустити WebAPI назад
```bash
docker-compose start webapi
```