# Practical lesson pz-Monitoring-Observability
> Practical implementation of Monitoring & Observability

## 📌 Practical lesson description

In this lesson, students acquire practical skills in deploying containerized services and configuring monitoring and observability in information systems.

The objective is to build a basic **Monitoring & Observability** infrastructure that includes:
- containerized services
- metrics collection
- system state monitoring
- alerting
- metrics visualization

## 🎯 Lesson objectives

1. Deploy several services in Docker containers:
- Web (Frontend)
- WebAPI (Backend)
- MQTT Broker
2. Configure a monitoring system:
- either Zabbix
- or Prometheus + Grafana
3. Implement an alerting mechanism for service downtime
4. Build a dashboard to visualize the system state

## 🛠 What need to do:

### 1.1 Create the project structure
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

### 1.2 Implement the services

### ✅ Web
- A simple web server (Node.js or Nginx)
- Sends requests to the WebAPI
- Displays service status

### ✅ WebAPI
- REST API with endpoints:
    - `/health` — returns service status
    - `/metrics` — returns metrics for Prometheus
- Request logging

### ✅ MQTT Broker
- Deploy a broker (e.g., Mosquitto)
- WebAPI or a separate service must publish messages:
    - `service/web/status`
    - `service/webapi/status`
    - `alerts/service-status`

## 2️⃣ Monitoring configuration

### Option A — Zabbix

- Deploy the Zabbix server
- Install the agent
- Add a host
- Configure a trigger for container shutdown

### Option B — Prometheus + Grafana

### Prometheus:
- Add scrape config for:
    - WebAPI
    - Docker (via node-exporter or cAdvisor)
- Create alerting rules

### Grafana:
- Connect Prometheus as a Data Source
- Build a dashboard with panels:
    - CPU usage
    - RAM usage
    - Container status
    - HTTP request rate
    - MQTT availability

## 3️⃣ Alerting implementation

A notification mechanism must be implemented:

When any container stops:
- An alert is generated
- A notification is sent via:
    - Email / Telegram / Slack
    - or MQTT topic `alerts/service-status`

## 4️⃣ Fault tolerance testing

1. Start all services with docker-compose:
   ```
   docker compose up -d
   ```

2. Verify:
- Metrics are being collected
- Data is displayed in Grafana
- MQTT publishes status

3. Stop a container:
   ```
   docker stop  <container name> 
   ```
   
4. Verify:
- Did the alert appear?
- Was the event recorded on the dashboard?
- Was a notification received?

## ✅ Acceptance criteria

The work is considered complete if:

- All services are deployed via docker-compose
- Monitoring collects metrics
- At least one fully functional dashboard is built
- At least one alert is configured
- A notification is generated when a container stops
- README includes:
- Instructions for running the project
- Architecture description
- Screenshots
- Description of implemented alerting
- Architecture description
- Dashboard screenshots

## 📎 Expected outcome

The student should demonstrate:
- Understanding the difference between Monitoring and Observability
- Ability to work with containers
- Ability to configure metrics and alerting
- Ability to build informative dashboards

Check:
- Did the alert appear?
- Was the event recorded on the dashboard?
- Was a notification received?

## Self-study tasks

1. Add logging (e.g., Loki + Grafana)
2. Implement a Healthcheck in docker-compose
3. Build a separate dashboard:
- Service SLA
- Availability (%)
- Error rate
4. Implement centralized log collection
5. Configure restart policy
6. Implement monitoring of MQTT topics

## Useful links

[Comparing Grafana Loki and Elastic stack](https://medium.com/@artemgontar16/the-grafana-loki-and-elastic-stack-are-both-powerful-tools-used-for-log-management-and-analysis-2a017b4212aa)
[Grafana Loki vs. ELK Stack: The Modern Logging Showdown](https://medium.com/@mdportnov/grafana-loki-vs-elk-stack-the-modern-logging-showdown-a85a4c3e0f34)
[Observability vs Monitoring: What Really Matters](https://careers.epam.ua/blog/observability-vs-monitoring-what-really-matters-for-system-reliability)
[Prometheus vs Grafana: Top Differences](https://www.geeksforgeeks.org/devops/prometheus-vs-grafana/)
[Observability and Monitoring in DevOps: A Comprehensive Guide](https://medium.com/@shuubham.pawar.368/observability-and-monitoring-in-devops-a-comprehensive-guide-d8ca302a918b)
[Site Reliability Engineering (SRE) explained](https://blog.invgate.com/site-reliability-engineering)
