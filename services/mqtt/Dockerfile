FROM eclipse-mosquitto:2-alpine

COPY mosquitto.conf /mosquitto/config/mosquitto.conf
COPY acl.txt /mosquitto/config/acl.txt

EXPOSE 1883 8883 9001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD mosquitto_sub -h localhost -t '$SYS/broker/version' -E -C 1 || exit 1

CMD ["/usr/sbin/mosquitto", "-c", "/mosquitto/config/mosquitto.conf"]
