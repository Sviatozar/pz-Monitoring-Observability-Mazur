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
