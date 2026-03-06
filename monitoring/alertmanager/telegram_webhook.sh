#!/bin/bash

TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:8642440451:}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:}"

TELEGRAM_API_URL="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage"

send_telegram_message() {
    local message="$1"
    
    message=$(echo "$message" | sed 's/"/\\"/g' | sed 's/$/\\n/g' | tr -d '\n')
    
    curl -s -X POST "$TELEGRAM_API_URL" \
        -H 'Content-Type: application/json' \
        -d "{\"chat_id\": $TELEGRAM_CHAT_ID, \"text\": \"$message\", \"parse_mode\": \"HTML\"}" > /dev/null
}

read_json() {
    local input=""
    while IFS= read -r line; do
        input="$input$line"
    done
    echo "$input"
}

process_alerts() {
    local json="$1"
    
    local alerts=$(echo "$json" | grep -o '"alert":"[^"]*"' | cut -d'"' -f4)
    local status=$(echo "$json" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    local severity=$(echo "$json" | grep -o '"severity":"[^"]*"' | cut -d'"' -f4)
    
    local emoji=""
    case "$severity" in
        critical) emoji="🔴" ;;
        warning)  emoji="🟡" ;;
        info)     emoji="🔵" ;;
        *)        emoji="⚪" ;;
    esac
    
    local status_text="❌ TRIGGERED"
    [ "$status" = "resolved" ] && status_text="✅ RESOLVED"
    
    local message="${emoji} <b>Alert: $alerts</b>
Status: $status_text
Severity: $severity
Time: $(date '+%Y-%m-%d %H:%M:%S')
"
    
    send_telegram_message "$message"
}

main() {
    local json=$(read_json)
    
    if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ "$TELEGRAM_BOT_TOKEN" = "YOUR_BOT_TOKEN_HERE" ]; then
        echo "Error: TELEGRAM_BOT_TOKEN не встановлений"
        exit 1
    fi
    
    if [ -z "$TELEGRAM_CHAT_ID" ] || [ "$TELEGRAM_CHAT_ID" = "YOUR_CHAT_ID_HERE" ]; then
        echo "Error: TELEGRAM_CHAT_ID не встановлений"
        exit 1
    fi
    
    process_alerts "$json"
}

main
