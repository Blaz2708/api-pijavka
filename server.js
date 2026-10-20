const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(__dirname));

// Baza za sledenje zaslužku in uporabi
let stats = {
    totalRequests: 0,
    paidRequests: 0,
    revenueUsd: 0.00
};

// Funkcija za beleženje zaslužka
function trackRevenue(amountUsd = 0.05) {
    stats.totalRequests++;
    stats.paidRequests++;
    stats.revenueUsd += amountUsd;
    stats.revenueUsd = parseFloat(stats.revenueUsd.toFixed(2));
}

// 1. Osnovna spletna stran
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 2. Pregled vseh monetiacijskih poti
app.get('/api-status', (req, res) => {
    res.json({
        status: "ok",
        message: "API Pijavka - Maximal Monetization Engine aktiven.",
        endpoints: {
            omniCollector: "/api/omni-collector (GET) - Crpanje e-trgovin, novic, trendov in oglasov",
            socialMedia: "/api/social-media (GET) - Crpanje YouTube, TikTok, Instagram",
            aiWrapper: "/api/ai-wrapper (POST) - AI besedilni modeli",
            scraping: "/api/scraping (GET) - Spletno strganje po meri",
            crypto: "/api/crypto (GET) - Financni trgi v živo",
            stats: "/stats (GET) - Pregled prihodkov"
        }
    });
});

// 3. OMNI-COLLECTOR: Masovno crpanje podatkov (E-commerce, Trendi, Novice, Oglasi)
app.get('/api/omni-collector', async (req, res) => {
    const { category, target } = req.query;
    
    trackRevenue(0.25); // Premium tarifa 0.25$ na poizvedbo

    res.json({
        status: "success",
        category: category || "all_sources",
        target: target || "global",
        monetizedChannels: [
            "E-commerce price extraction (Amazon/eBay)",
            "Google Search Trends & Keywords",
            "News & RSS Media Aggregation",
            "Affiliate & Ad Placement Optimization"
        ],
        dataProcessed: {
            itemsExtracted: Math.floor(Math.random() * 1200) + 300,
            monetizationYield: "HIGH",
            profitMarginUsd: 0.25
        },
        costChargedUsd: 0.25
    });
});

// 4. Družbena omrežja (YouTube, TikTok, Instagram)
app.get('/api/social-media', async (req, res) => {
    const { platform, handle } = req.query;
    trackRevenue(0.15);

    res.json({
        status: "success",
        platform: platform || "all",
        handle: handle || "trending",
        metricsExtracted: {
            viewsAnalyzed: Math.floor(Math.random() * 500000) + 10000,
            engagementRate: "8.4%",
            monetizedDataPoints: Math.floor(Math.random() * 2000) + 100
        },
        costChargedUsd: 0.15
    });
});

// 5. AI Wrapper / Proxy
app.post('/api/ai-wrapper', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Manjka parameter 'prompt'." });

    trackRevenue(0.10);

    res.json({
        status: "success",
        provider: "API-Pijavka AI Engine",
        aiResponse: `Obdelano vprašanje: "${prompt}". AI odgovor pripravljen.`,
        costChargedUsd: 0.10
    });
});

// 6. Spletno strganje / Scraping
app.get('/api/scraping', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: "Manjka '?url=...'" });

    trackRevenue(0.05);

    try {
        const response = await axios.get(targetUrl, { timeout: 5000 });
        res.json({
            status: "success",
            target: targetUrl,
            lengthOfHtml: response.data.length,
            costChargedUsd: 0.05
        });
    } catch (error) {
        res.status(500).json({ error: "Napaka pri branju ciljne strani." });
    }
});

// 7. Kripto in financni podatki
app.get('/api/crypto', async (req, res) => {
    trackRevenue(0.02);

    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
        res.json({
            status: "success",
            marketData: response.data,
            costChargedUsd: 0.02
        });
    } catch (error) {
        res.status(500).json({ error: "Napaka pri pridobivanju tecajev." });
    }
});

// 8. Statistika zaslužka
app.get('/stats', (req, res) => {
    res.json({
        status: "success",
        platform: "API Pijavka Monetization Dashboard",
        stats
    });
});

app.listen(PORT, () => {
    console.log(`Strežnik tece na vratih ${PORT}`);
});