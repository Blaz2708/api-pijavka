const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(__dirname));

// Baza veljavnih API kljucev (simulacija baze narocnikov)
const VALID_API_KEYS = [
    "PIJAVKA-SECRET-KEY-123",
    "PIJAVKA-PREMIUM-KEY-999",
    "DEMO-FREE-KEY"
];

// Baza za sledenje zaslužku in logom
let stats = {
    totalRequests: 0,
    paidRequests: 0,
    revenueUsd: 0.00,
    logs: []
};

// Funkcija za beleženje zaslužka in webhook obvestil
function trackRevenue(amountUsd = 0.05, endpointName = "unknown") {
    stats.totalRequests++;
    stats.paidRequests++;
    stats.revenueUsd += amountUsd;
    stats.revenueUsd = parseFloat(stats.revenueUsd.toFixed(2));

    const logEntry = {
        timestamp: new Date().toISOString(),
        endpoint: endpointName,
        earned: `$${amountUsd}`,
        totalSoFar: `$${stats.revenueUsd}`
    };

    stats.logs.unshift(logEntry); // Dodaj na zacetek
    if (stats.logs.length > 20) stats.logs.pop(); // Hranimo zadnjih 20 zapisov

    console.log(`[WEBHOOK / OBVESTILO] Nov zaslužek! ${endpointName} -> +$${amountUsd} (Skupaj: $${stats.revenueUsd})`);
}

// Middleware za preverjanje API kljuca (lahko se posreduje preko query parameter ?apikey=... ali header-ja x-api-key)
function authenticateApiKey(req, res, next) {
    const apiKey = req.query.apikey || req.headers['x-api-key'];

    // Dovolimo dostop do osnovnih javnih poti
    if (req.path === '/' || req.path === '/api-status' || req.path === '/stats' || req.path === '/index.html') {
        return next();
    }

    // Za demo namene omogocimo tudi privzeti kljuc, ce uporabnik ne navede nobenega
    if (!apiKey || apiKey === "DEMO") {
        req.apiKeyUsed = "DEMO-FREE-KEY";
        return next();
    }

    if (!VALID_API_KEYS.includes(apiKey)) {
        return res.status(401).json({
            error: "Nepatrjen ali neveljaven API kljuc. Dostop zavrnjen.",
            hint: "Uporabi veljaven apikey v povezavi (?apikey=PIJAVKA-SECRET-KEY-123)"
        });
    }

    req.apiKeyUsed = apiKey;
    next();
}

app.use(authenticateApiKey);

// 1. Osnovna spletna stran
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 2. Status API-ja
app.get('/api-status', (req, res) => {
    res.json({
        status: "ok",
        message: "API Pijavka - Commercial Pro Engine aktiven.",
        authRequired: "Uporabi ?apikey=... za komercialne klices",
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

// 3. PRAVI WEB SCRAPER
app.get('/api/scraping', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: "Manjka parameter '?url=...'" });

    trackRevenue(0.08, "/api/scraping");

    try {
        const response = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            timeout: 6000
        });

        const html = response.data;
        // Enostavno izlušcenje naslova (<title>) in meta opisa
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const extractedTitle = titleMatch ? titleMatch[1] : "Naslov ni najden";

        res.json({
            status: "success",
            target: targetUrl,
            extractedData: {
                pageTitle: extractedTitle,
                contentLength: html.length,
                scrapedAt: new Date().toISOString()
            },
            costChargedUsd: 0.08,
            apiKey: req.apiKeyUsed
        });
    } catch (error) {
        res.status(500).json({ error: "Napaka pri strganju ciljne strani: " + error.message });
    }
});

// 4. OMNI-COLLECTOR
app.get('/api/omni-collector', async (req, res) => {
    trackRevenue(0.25, "/api/omni-collector");

    res.json({
        status: "success",
        category: req.query.category || "all_sources",
        dataProcessed: {
            itemsExtracted: Math.floor(Math.random() * 1000) + 200,
            monetizationYield: "HIGH",
            webhookTriggered: true
        },
        costChargedUsd: 0.25,
        apiKey: req.apiKeyUsed
    });
});

// 5. DRUŽBENA OMREŽJA
app.get('/api/social-media', async (req, res) => {
    trackRevenue(0.15, "/api/social-media");

    res.json({
        status: "success",
        platform: req.query.platform || "all",
        metrics: {
            analyzedPosts: Math.floor(Math.random() * 800) + 100,
            reach: "45K+",
            webhookTriggered: true
        },
        costChargedUsd: 0.15,
        apiKey: req.apiKeyUsed
    });
});

// 6. AI WRAPPER
app.post('/api/ai-wrapper', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Manjka parameter 'prompt'." });

    trackRevenue(0.10, "/api/ai-wrapper");

    res.json({
        status: "success",
        aiResponse: `Obdelan prompt: "${prompt}". AI posredniški odziv uspešen.`,
        costChargedUsd: 0.10,
        apiKey: req.apiKeyUsed
    });
});

// 7. KRIPTO
app.get('/api/crypto', async (req, res) => {
    trackRevenue(0.02, "/api/crypto");

    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
        res.json({
            status: "success",
            marketData: response.data,
            costChargedUsd: 0.02,
            apiKey: req.apiKeyUsed
        });
    } catch (error) {
        res.status(500).json({ error: "Napaka pri pridobivanju tecajev." });
    }
});

// 8. STATISTIKA IN WEBHOOK LOGI
app.get('/stats', (req, res) => {
    res.json({
        status: "success",
        platform: "API Pijavka Monetization & Commercial Dashboard",
        stats
    });
});

app.listen(PORT, () => {
    console.log(`Strežnik tece na vratih ${PORT}`);
});