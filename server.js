const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Veljavni globalni API kljuci
const VALID_API_KEYS = [
    "PIJAVKA-GLOBAL-SECRET-123",
    "PIJAVKA-PREMIUM-KEY-999",
    "DEMO-FREE-KEY"
];

// Konfiguracija za Telegram obvestila (vpiši svoj token in chat ID, ko ga ustvariš)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

const EXCHANGE_RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 155.0,
    BTC: 0.000015
};

let stats = {
    totalRequests: 0,
    paidRequests: 0,
    revenueUsd: 0.00,
    globalHitsByRegion: { US: 0, EU: 0, ASIA: 0, OTHER: 0 },
    logs: []
};

// Funkcija za pošiljanje Telegram obvestila
async function sendTelegramAlert(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return; // Preskoci, ce ni nastavljeno
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (error) {
        console.error("Napaka pri pošiljanju Telegram obvestila:", error.message);
    }
}

// Funkcija za beleženje zaslužka in proženje webhookov
function trackRevenue(amountUsd = 0.05, endpointName = "unknown", req = null) {
    stats.totalRequests++;
    stats.paidRequests++;
    stats.revenueUsd += amountUsd;
    stats.revenueUsd = parseFloat(stats.revenueUsd.toFixed(2));

    const acceptLang = req ? (req.headers['accept-language'] || '') : '';
    let region = "OTHER";
    if (acceptLang.includes('en-US') || acceptLang.includes('en')) region = "US";
    else if (acceptLang.includes('de') || acceptLang.includes('fr') || acceptLang.includes('sl') || acceptLang.includes('es')) region = "EU";
    else if (acceptLang.includes('zh') || acceptLang.includes('ja') || acceptLang.includes('ko')) region = "ASIA";

    stats.globalHitsByRegion[region]++;

    const logEntry = {
        timestampUtc: new Date().toISOString(),
        endpoint: endpointName,
        region: region,
        earnedUsd: `$${amountUsd}`,
        totalUsdSoFar: `$${stats.revenueUsd}`
    };

    stats.logs.unshift(logEntry);
    if (stats.logs.length > 30) stats.logs.pop();

    // Pošlji Telegram obvestilo v živo
    const alertMessage = `?? *API Pijavka ZASLUŽEK!*\n\n?? Znesek: \`+$${amountUsd}\`\n?? Pot: \`${endpointName}\`\n?? Regija: \`${region}\`\n?? Skupaj: \`$${stats.revenueUsd}\``;
    sendTelegramAlert(alertMessage);
}

// Middleware za avtentikacijo
function authenticateApiKey(req, res, next) {
    const apiKey = req.query.apikey || req.headers['x-api-key'];

    if (req.path === '/' || req.path === '/api-status' || req.path === '/stats' || req.path === '/index.html') {
        return next();
    }

    if (!apiKey || apiKey === "DEMO") {
        req.apiKeyUsed = "DEMO-FREE-KEY";
        return next();
    }

    if (!VALID_API_KEYS.includes(apiKey)) {
        return res.status(401).json({
            error: "Unauthorized access / Neveljaven API kljuc.",
            status: 401
        });
    }

    req.apiKeyUsed = apiKey;
    next();
}

app.use(authenticateApiKey);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api-status', (req, res) => {
    res.json({
        status: "ok",
        engine: "API Pijavka Global Engine v2.1 + Telegram Webhooks",
        endpoints: {
            omniCollector: "/api/omni-collector (GET)",
            socialMedia: "/api/social-media (GET)",
            aiWrapper: "/api/ai-wrapper (POST)",
            scraping: "/api/scraping (GET)",
            crypto: "/api/crypto (GET)",
            stats: "/stats (GET)"
        }
    });
});

app.get('/api/scraping', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: "Missing '?url=...' parameter." });

    trackRevenue(0.08, "/api/scraping", req);

    try {
        const response = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            timeout: 8000
        });

        const html = response.data;
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const extractedTitle = titleMatch ? titleMatch[1] : "No Title Found";

        res.json({
            status: "success",
            target: targetUrl,
            extractedData: { pageTitle: extractedTitle, contentLength: html.length },
            costChargedUsd: 0.08,
            apiKey: req.apiKeyUsed
        });
    } catch (error) {
        res.status(500).json({ error: "Global scraping error: " + error.message });
    }
});

app.get('/api/omni-collector', async (req, res) => {
    trackRevenue(0.25, "/api/omni-collector", req);
    res.json({
        status: "success",
        category: req.query.category || "all_sources",
        dataProcessed: { itemsExtracted: Math.floor(Math.random() * 2000) + 500 },
        costChargedUsd: 0.25,
        apiKey: req.apiKeyUsed
    });
});

app.get('/api/social-media', async (req, res) => {
    trackRevenue(0.15, "/api/social-media", req);
    res.json({
        status: "success",
        platform: req.query.platform || "all_networks",
        globalMetrics: { analyzedPosts: Math.floor(Math.random() * 1500) + 300 },
        costChargedUsd: 0.15,
        apiKey: req.apiKeyUsed
    });
});

app.post('/api/ai-wrapper', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing 'prompt'." });

    trackRevenue(0.10, "/api/ai-wrapper", req);
    res.json({
        status: "success",
        aiResponse: `Processed prompt: "${prompt}".`,
        costChargedUsd: 0.10,
        apiKey: req.apiKeyUsed
    });
});

app.get('/api/crypto', async (req, res) => {
    trackRevenue(0.02, "/api/crypto", req);
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd,eur');
        res.json({
            status: "success",
            marketData: response.data,
            costChargedUsd: 0.02,
            apiKey: req.apiKeyUsed
        });
    } catch (error) {
        res.status(500).json({ error: "Financial API error." });
    }
});

app.get('/stats', (req, res) => {
    res.json({
        status: "success",
        platform: "API Pijavka Global Monetization Dashboard",
        stats
    });
});

app.listen(PORT, () => {
    console.log(`Global Server running on port ${PORT}`);
});