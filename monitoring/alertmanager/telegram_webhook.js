#!/usr/bin/env node

const http = require('http');
const https = require('https');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID';

function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const postData = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: text,
    parse_mode: 'HTML'
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      res.on('data', () => {}); 
      
      res.on('end', () => resolve());
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function formatAlert(alert) {
  const alertname = alert.labels?.alertname || 'Unknown';
  const severity = alert.labels?.severity || 'unknown';
  const status = alert.status || 'unknown';

  const emojiMap = {
    'critical': '🔴',
    'warning': '🟡',
    'info': '🔵'
  };
  const emoji = emojiMap[severity] || '⚪';
  const statusText = status === 'firing' ? '❌ TRIGGERED' : '✅ RESOLVED';

  return `
${emoji} <b>${alertname}</b>
Status: ${statusText}
Severity: ${severity}
Time: ${new Date().toLocaleString()}

${alert.annotations?.description || ''}
  `.trim();
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/alert') {
    let data = '';

    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', async () => {
      try {
        const alerts = JSON.parse(data);
        
        for (const alert of alerts.alerts || []) {
          const message = formatAlert(alert);
          await sendTelegramMessage(message);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Telegram webhook server running on port ${PORT}`);
});