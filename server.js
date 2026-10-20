const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Omogoca dostop iz celega sveta (Cross-Origin)
const app = express();
const PORT = process.env.PORT || 10000;

// Omogocimo globalni CORS za vse domene na svetu
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Baza veljavnih mednarodnih API kljucev
const VALID_API_KEYS = [
    "PIJAVKA-GLOBAL-SECRET-123",
    "PIJAVKA-PREMIUM-KEY-999",
    "DEMO-FREE-KEY"
];

// Menjalni tecaji glede na USD
const EXCHANGE_RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 155.0,
    BTC: 0.000015
};

// Globalna baza za sledenje uporabi in prihodkom
let stats = {
    totalRequests: 0,
    paidRequests: 0,
    revenueUsd: 0.00,
    globalHitsByRegion: {
        US: 0,
        EU: 0,
        ASIA: 0,
        OTHER: 0
    },
    logs: []
};

// Funkcija za beleženje globalnega zaslužka
function trackRevenue(amountUsd = 0.05, endpointName = "unknown", req = null) {
    stats.totalRequests++;
    stats.paidRequests++;
    stats.revenueUsd += amountUsd;
    stats.revenueUsd = parseFloat(stats.revenueUsd.toFixed(2));

    // Dolocitev regije na podlagi sprejetih jezikov ali IP glave
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

    console.log(`[GLOBAL WEBHOOK] +$${amountUsd} via ${endpointName} [Region: ${region}]`);
}

// Middleware za globalno avtentikacijo
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
            error: "Unauthorized access / Neveljaven globalni API kljuc.",
            status: 401,
            hint: "Pass ?apikey=PIJAVKA-GLOBAL-SECRET-123 in your query parameters."
        });
    }

    req.apiKeyUsed = apiKey;
    next();
}

app.use(authenticateApiKey);

// 1. Domaca stran
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 2. Globalni Status API-ja
app.get('/api-status', (req, res) => {
    res.json({
        status: "ok",
        engine: "API Pijavka Global Engine v2.0",
        globalAccess: "ENABLED (CORS Open Worldwide)",
        supportedCurrencies: Object.keys(EXCHANGE_RATES),
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

// 3. GLOBALNI WEB SCRAPER (z mednarodnimi glavami)
app.get('/api/scraping', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: "Missing '?url=...' parameter." });

    trackRevenue(0.08, "/api/scraping", req);

    try {
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 8000
        });

        const html = response.data;
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const extractedTitle = titleMatch ? titleMatch[1] : "No Title Found";

        res.json({
            status: "success",
            target: targetUrl,
            extractedData: {
                pageTitle: extractedTitle,
                contentLength: html.length,
                scrapedAtUtc: new Date().toISOString()
            },
            costChargedUsd: 0.08,
            apiKey: req.apiKeyUsed
        });
    } catch (error) {
        res.status(500).json({ error: "Global scraping error: " + error.message });
    }
});

// 4. OMNI-COLLECTOR (E-Commerce, Novice, Trendi po svetu)
app.get('/api/omni-collector', async (req, res) => {
    const currency = (req.query.currency || "USD").toUpperCase();
    const rate = EXCHANGE_RATES[currency] || 1.0;
    const baseCostUsd = 0.25;
    const convertedCost = (baseCostUsd * rate).toFixed(4);

    trackRevenue(baseCostUsd, "/api/omni-collector", req);

    res.json({
        status: "success",
        region: req.query.region || "GLOBAL",
        category: req.query.category || "all_sources",
        dataProcessed: {
            itemsExtracted: Math.floor(Math.random() * 2000) + 500,
            globalNodesActive: 14,
            monetizationYield: "OPTIMAL"
        },
        costCharged: `${convertedCost} ${currency}`,
        costChargedUsd: baseCostUsd,
        apiKey: req.apiKeyUsed
    });
});

// 5. DRUŽBENA OMREŽJA (TikTok, IG, YT - Globalno)
app.get('/api/social-media', async (req, res) => {
    trackRevenue(0.15, "/api/social-media", req);

    res.json({
        status: "success",
        platform: req.query.platform || "all_networks",
        globalMetrics: {
            analyzedPosts: Math.floor(Math.random() * 1500) + 300,
            estimatedGlobalReach: "250K+",
            topLocations: ["US", "DE", "JP", "UK", "BR"]
        },
        costChargedUsd: 0.15,
        apiKey: req.apiKeyUsed
    });
});

// 6. AI WRAPPER (Vecjezikovni AI Proxy)
app.post('/api/ai-wrapper', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing 'prompt' in JSON body." });

    trackRevenue(0.10, "/api/ai-wrapper", req);

    res.json({
        status: "success",
        aiResponse: `Processed global prompt: "${prompt}". Global AI Proxy Response complete.`,
        costChargedUsd: 0.10,
        apiKey: req.apiKeyUsed
    });
});

// 7. GLOBALNI KRIPTO IN FINANCNI TRGI
app.get('/api/crypto', async (req, res) => {
    trackRevenue(0.02, "/api/crypto", req);

    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,ripple&vs_currencies=usd,eur,gbp,jpy');
        res.json({
            status: "success",
            marketData: response.data,
            costChargedUsd: 0.02,
            apiKey: req.apiKeyUsed
        });
    } catch (error) {
        res.status(500).json({ error: "Global financial API error." });
    }
});

// 8. GLOBALNA STATISTIKA IN LOGI
app.get('/stats', (req, res) => {
    res.json({
        status: "success",
        platform: "API Pijavka Global Monetization Dashboard",
        exchangeRates: EXCHANGE_RATES,
        stats
    });
});

app.listen(PORT, () => {
    console.log(`Global Server running on port ${PORT}`);
});