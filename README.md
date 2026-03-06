# Practical lesson pz-Monitoring-Observability
> Практична реалізація моніторингу та спостережуваності (Monitoring & Observability)

## 📌 Опис практичного заняття

У цьому занятті здобувачі отримують практичні навички розгортання контейнеризованих сервісів, налаштування моніторингу та спостережуваності в інформаційних системах.

Мета роботи — побудувати базову інфраструктуру **Monitoring & Observability**, яка включає:
- контейнеризовані сервіси
- збір метрик
- моніторинг стану системи
- алертинг
- візуалізацію показників

## 🎯 Мета заняття

1. Розгорнути декілька сервісів у Docker-контейнерах:
  - Web (Frontend)
  - WebAPI (Backend)
  - MQTT Broker
2. Налаштувати систему моніторингу:
  - або Zabbix
  - або Prometheus + Grafana
3. Реалізувати механізм алертингу при зупинці сервісу.
4. Побудувати дашборд для візуалізації стану системи.

## 🛠 What need to do:

### 1.1 Створити структуру проєкту

```
pz-Monitoring-Observability/
│
├── services/
│   ├── web/
│   ├── webapi/
│   ├── mqtt/
│
├── monitoring/
│   ├── prometheus/
│   ├── grafana/
│
├── docker-compose.yaml
└── README.md
```

### 1.2 Реалізувати сервіси

### ✅ Web
- Простий веб-сервер (Node.js або Nginx)
- Виконує запит до WebAPI
- Відображає статус сервісу

### ✅ WebAPI
- REST API з endpoint:
  - `/health` — повертає статус сервісу
  - `/metrics` — повертає метрики для Prometheus
- Логування запитів

### ✅ MQTT Broker
- Розгорнути брокер (наприклад Mosquitto)
- WebAPI або окремий сервіс має публікувати повідомлення:
  - `service/web/status`
  - `service/webapi/status`
  - `alerts/service-status`

## 2️⃣ Налаштування моніторингу

### Варіант A — Zabbix

- Розгорнути сервер Zabbix
- Встановити агент
- Додати хост
- Налаштувати тригер на зупинку контейнера


### Варіант B — Prometheus + Grafana

### Prometheus:
- Додати scrape config для:
  - WebAPI
  - Docker (через node-exporter або cAdvisor)
- Створити правила алертингу

### Grafana:
- Підключити Prometheus як Data Source
- Побудувати дашборд з панелями:
  - CPU usage
  - RAM usage
  - Container status
  - HTTP request rate
  - MQTT availability

---

## 3️⃣ Реалізація алертингу

Необхідно реалізувати механізм сповіщення:

При зупинці будь-якого контейнера:
- Генерується alert
- Відправляється повідомлення:
  - Email / Telegram / Slack
  - або у MQTT topic `alerts/service-status`


## 4️⃣ Перевірка відмовостійкості

1. Запустити всі сервіси через docker-compose:
   ```
   docker compose up -d
   ```

2. Перевірити:
  - Метрики збираються
  - Дані відображаються в Grafana
  - MQTT публікує статус

3. Зупинити контейнер:
   ```
   docker stop webapi
   ```

4. Перевірити:
  - Чи з’явився alert?
  - Чи зафіксована подія на дашборді?
  - Чи надійшло повідомлення?

## ✅ Acceptance criteria

Робота вважається виконаною, якщо:

- Усі сервіси розгорнуті через docker-compose
- Моніторинг збирає метрики
- Побудовано мінімум 1 повноцінний дашборд
- Налаштовано хоча б 1 alert
- При зупинці контейнера генерується повідомлення
- README містить:
  - Інструкцію запуску
  - Опис архітектури
  - Скріншоти
  - Опис реалізованого алертингу
- Опис архітектури
- Скріншоти дашборду

## 📎 Очікуваний результат

Здобувач повинен продемонструвати:
- Розуміння різниці між Monitoring та Observability
- Вміння працювати з контейнерами
- Вміння налаштовувати метрики та алертинг
- Вміння будувати інформативні дашборди

Перевірити:
- Чи з'явився alert?
- Чи зафіксована подія на дашборді?
- Чи надійшло повідомлення?

---

## 🚀 ПРАКТИЧНА РЕАЛІЗАЦІЯ - Prometheus + Grafana + EMQX + Alertmanager

### Архітектура системи

```
┌─────────────────────────────────────────────────────────────┐
│                     Monitoring Stack                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Nginx     │  │   WebAPI     │  │    EMQX      │       │
│  │   (Port 80)  │  │  (Port 5000) │  │  (Port 1883) │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │               │                     │               │
│         └───────────────┼─────────────────────┘               │
│                         │ /metrics                            │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────┐        │
│  │            Prometheus (Port 9090)                │        │
│  │  ✓ Scrapes metrics from WebAPI                  │        │
│  │  ✓ Scrapes cAdvisor (containers)                │        │
│  │  ✓ Scrapes node-exporter (system)               │        │
│  │  ✓ Evaluates alert rules                        │        │
│  └──────────────────────────────────────────────────┘        │
│         │                          │                         │
│         │ alerts                   │ queries                 │
│         ↓                          ↓                         │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Alertmanager    │    │    Grafana       │               │
│  │  (Port 9093)     │    │  (Port 3000)     │               │
│  │                  │    │                  │               │
│  │ Routing alerts   │    │ Visualizes data  │               │
│  │ Send to Telegram │    │ Shows dashboards │               │
│  └──────────────────┘    └──────────────────┘               │
│         │                                                    │
│         └──────→ Telegram (notifications)                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Структура проєкту

```
pz-Monitoring-Observability/
│
├── docker-compose.yaml           # Конфігурація всіх контейнерів
│
├── services/
│   ├── web/
│   │   ├── Dockerfile            # Nginx контейнер
│   │   ├── nginx.conf            # Конфігурація Nginx
│   │   ├── default.conf          # Віртуальний хост
│   │   └── public/
│   │       └── index.html        # Статична сторінка
│   │
│   ├── webapi/
│   │   ├── Dockerfile            # Node.js контейнер
│   │   ├── package.json          # Залежності Node.js
│   │   ├── server.js             # REST API сервер
│   │   └── .env                  # Змінні оточення
│   │
│   └── mqtt/
│       ├── Dockerfile            # Mosquitto контейнер
│       ├── mosquitto.conf        # Конфігурація MQTT брокера
│       └── acl.txt               # Access Control List
│
└── monitoring/
    ├── prometheus/
    │   ├── prometheus.yml        # Конфігурація Prometheus
    │   └── alert.rules.yml       # Правила алертингу
    │
    ├── alertmanager/
    │   ├── alertmanager.yml      # Конфігурація Alertmanager
    │   └── telegram_webhook.sh   # Скрипт для Telegram
    │
    └── grafana/
        ├── provisioning/
        │   ├── datasources/
        │   │   └── prometheus.yml
        │   └── dashboards/
        │       └── dashboards.yml
        └── dashboards/
            └── monitoring.json   # Дашборд метрик
```

### Запуск системи

#### Попередні вимоги
- Docker та Docker Compose (версія 3.8+)
- Linux/macOS або WSL2 на Windows
- Мінімум 4 ГБ оперативної пам'яті

#### Кроки запуску

**1. Встановити залежності WebAPI:**

```bash
cd services/webapi
npm install
cd ../..
```

**2. Запустити контейнери:**

```bash
docker-compose up -d
```

**3. Перевірити статус контейнерів:**

```bash
docker-compose ps
```

Очікуваний результат:
```
NAME                    STATUS
monitoring-web          Up (healthy)
monitoring-webapi       Up (healthy)
monitoring-emqx         Up (healthy)
monitoring-prometheus   Up (healthy)
monitoring-grafana      Up (healthy)
monitoring-alertmanager Up (healthy)
monitoring-cadvisor     Up
monitoring-node-exporter Up
```

#### Доступ до сервісів

| Сервіс | URL | Призначення |
|--------|-----|-----------|
| **Web (Nginx)** | http://localhost:80 | Фронтенд з посиланнями |
| **WebAPI** | http://localhost:5000 | REST API |
| **Prometheus** | http://localhost:9090 | Збір метрик |
| **Grafana** | http://localhost:3000 | Дашборди (admin/admin123) |
| **Alertmanager** | http://localhost:9093 | Управління алертами |
| **EMQX Dashboard** | http://localhost:18083 | MQTT брокер (admin/public) |
| **cAdvisor** | http://localhost:8080 | Метрики контейнерів |

### Налаштування Telegram алертингу

Щоб отримувати алерти в Telegram, необхідно:

**1. Створити Telegram бота:**
- Напишіть [@BotFather](https://t.me/botfather) в Telegram
- Виконайте команду `/newbot`
- Отримаєте `TELEGRAM_BOT_TOKEN`

**2. Отримати ID чату:**
- Напишіть @userinfobot в Telegram
- Отримаєте `TELEGRAM_CHAT_ID`

**3. Налаштувати Alertmanager:**

Відредагуйте `monitoring/alertmanager/alertmanager.yml`:

```yaml
global:
  slack_api_url: ''

route:
  receiver: 'telegram-notifications'
  
receivers:
  - name: 'telegram-notifications'
    webhook_configs:
      - url: 'http://telegram-webhook:3000/alert'
```

**4. Встановити змінні оточення:**

```bash
export TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN"
export TELEGRAM_CHAT_ID="YOUR_CHAT_ID"
```

### Тестування алертингу

**1. Запустити генератор навантаження:**

```bash
# Генерувати HTTP запити до WebAPI
curl -s http://localhost:5000/api/data &

# Або в циклі:
while true; do curl -s http://localhost:5000/api/data > /dev/null; sleep 1; done
```

**2. Зупинити контейнер для запуску алерту:**

```bash
docker-compose stop webapi
```

**3. Перевірити алерти:**

- У Prometheus: http://localhost:9090/alerts
- У Alertmanager: http://localhost:9093
- У Grafana: http://localhost:3000/alerting/list
- У Telegram: отримаєте повідомлення від бота

**4. Запустити контейнер назад:**

```bash
docker-compose start webapi
```

### Перегляд метрик у Prometheus

**1. Перейти на http://localhost:9090**

**2. Введення PromQL запитів:**

```promql
# Статус контейнерів
up{job="webapi"}

# Кількість HTTP запитів
http_requests_total

# Середнє час обробки запиту
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Використання CPU контейнером
rate(container_cpu_usage_seconds_total[5m]) * 100

# Використання пам'яті в МБ
container_memory_usage_bytes / 1024 / 1024
```

### Перегляд дашборду в Grafana

**1. Перейти на http://localhost:3000**

**2. Увійти:**
- Username: `admin`
- Password: `admin123`

**3. Обирати дашборд "Monitoring Dashboard"**

**4. Дашборд показує:**
- 📊 Статус сервісів (зелений/червоний)
- 📈 Процент використання CPU кожним контейнером
- 💾 Використання пам'яті (в МБ)
- 📡 Кількість HTTP запитів за секунду
- ⏱️ Час обробки запитів (percentiles)

### Налаштування нових alert правил

Відредагуйте `monitoring/prometheus/alert.rules.yml`:

```yaml
groups:
  - name: my_alerts
    rules:
      - alert: MyAlert
        expr: up{job="webapi"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "WebAPI is down"
```

Перезавантажити конфіг:
```bash
curl -X POST http://localhost:9090/-/reload
```

### Рішення проблем

**Контейнери не запускаються:**
```bash
# Перевірити логи
docker-compose logs -f webapi

# Перестартувати контейнер
docker-compose restart webapi
```

**Метрики не збираються:**
```bash
# Перевірити статус Prometheus
curl http://localhost:9090/-/healthy

# Перевірити targets
curl http://localhost:9090/api/v1/targets
```

**Grafana не показує дані:**
- Перевірити Data Source: Configuration > Data Sources > Prometheus
- Спробувати запит: `up` у тестовій вкладці

**Alertmanager не надсилає повідомлення:**
```bash
# Перевірити конфіг
docker-compose logs alertmanager

# Перезавантажити контейнер
docker-compose restart alertmanager
```

### Корисні команди

```bash
# Запустити все
docker-compose up -d

# Зупинити все
docker-compose down

# Переглянути логи всіх контейнерів
docker-compose logs -f

# Логи конкретного контейнера
docker-compose logs -f webapi

# Видалити всі дані (volume)
docker-compose down -v

# Перестартувати контейнер
docker-compose restart webapi

# Виконати команду у контейнері
docker-compose exec webapi npm start

# Перевірити метрики WebAPI
curl http://localhost:5000/metrics

# Перевірити здоров'я сервісів
curl http://localhost:5000/health
curl http://localhost:3000/api/health
curl http://localhost:9090/-/healthy
```

### Важливо для production

Перед розгортанням в production необхідно:

1. **Змінити паролі:**
   - Grafana admin пароль
   - MQTT користувачі та паролі

2. **Налаштувати persistence:**
   - Дати томам більший розмір
   - Налаштувати backup

3. **Добавити SSL/TLS:**
   - Сертифікати для HTTPS

4. **Налаштувати resource limits:**
   - Memory limits для контейнерів
   - CPU limits

5. **Увімкнути аутентифікацію:**
   - Prometheus auth
   - MQTT auth

6. **Централізоване логування:**
   - Додати Loki для логів
   - Додати логування у Grafana


## Самостійна робота

1. Додати логування (наприклад Loki + Grafana).
2. Реалізувати Healthcheck у docker-compose.
3. Побудувати окремий дашборд:
- SLA сервісу
- Availability (%)
- Error rate
4. Реалізувати централізований збір логів.
5. Налаштувати restart policy.
6. Реалізувати моніторинг MQTT topic.


## Useful links

[Comparing Grafana Loki and Elastic stack](https://medium.com/@artemgontar16/the-grafana-loki-and-elastic-stack-are-both-powerful-tools-used-for-log-management-and-analysis-2a017b4212aa)
[Grafana Loki vs. ELK Stack: The Modern Logging Showdown](https://medium.com/@mdportnov/grafana-loki-vs-elk-stack-the-modern-logging-showdown-a85a4c3e0f34)
[Спостережуваність vs Моніторинг: що насправді важливо](https://careers.epam.ua/blog/observability-vs-monitoring-what-really-matters-for-system-reliability)
[Prometheus vs Grafana: Top Differences](https://www.geeksforgeeks.org/devops/prometheus-vs-grafana/)
[Observability and Monitoring in DevOps: A Comprehensive Guide](https://medium.com/@shuubham.pawar.368/observability-and-monitoring-in-devops-a-comprehensive-guide-d8ca302a918b)
[Site Reliability Engineering (SRE) explained](https://blog.invgate.com/site-reliability-engineering)
