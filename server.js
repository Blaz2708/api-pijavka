const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(__dirname));

// Baza za sledenje zaslužku in uporabi (simulacija)
let stats = {
    totalRequests: 0,
    paidRequests: 0,
    revenueUsd: 0.00
};

// Pomožna funkcija za beleženje zaslužka ob vsakem klicu placljive poti
function trackRevenue(amountUsd = 0.05) {
    stats.totalRequests++;
    stats.paidRequests++;
    stats.revenueUsd += amountUsd;
    stats.revenueUsd = parseFloat(stats.revenueUsd.toFixed(2)); // Za lepe decimalke
}

// 1. Osnovna spletna stran
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 2. Status API-ja in pregled vseh poti
app.get('/api-status', (req, res) => {
    res.json({
        status: "ok",
        message: "API Pijavka All-in-One deluje polno operativno.",
        endpoints: {
            aiWrapper: "/api/ai-wrapper (POST) - Generiranje/obdelava besedil",
            scraping: "/api/scraping (GET) - Pridobivanje podatkov s spleta",
            crypto: "/api/crypto (GET) - Kripto in financni tecaji v živo",
            stats: "/stats (GET) - Pregled zaslužka in prometa"
        }
    });
});

// 3. MODUL: AI Wrapper / Proxy (Placljiv endpoint)
app.post('/api/ai-wrapper', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: "Manjka parameter 'prompt' v telesu zahteve (JSON)." });
    }

    trackRevenue(0.10); // Zaracunamo 0.10$ na AI klic

    try {
        // Tukaj lahko kasneje dodaš pravi kljuc do OpenAI/Anthropic/Gemini API-ja
        // Zaenkrat vrnemo pameten simuliran odgovor, ki dokazuje delovanje
        res.json({
            status: "success",
            provider: "API-Pijavka AI Engine",
            originalPrompt: prompt,
            aiResponse: `To je avtomatski odgovor na tvoje vprašanje: "${prompt}". Sistem deluje brezhibno!`,
            costChargedUsd: 0.10
        });
    } catch (error) {
        res.status(500).json({ error: "Napaka pri obdelavi AI zahteve." });
    }
});

// 4. MODUL: Spletno strganje / Scraping (Placljiv endpoint)
app.get('/api/scraping', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).json({ error: "Manjka parameter '?url=...' v povezavi." });
    }

    trackRevenue(0.05); // Zaracunamo 0.05$

    try {
        // Primer varnega pridobivanja podatkov s spleta preko axios
        const response = await axios.get(targetUrl, { timeout: 5000 });
        res.json({
            status: "success",
            target: targetUrl,
            lengthOfHtml: response.data.length,
            message: "Podatki s spletne strani uspešno prebrani in obdelani.",
            costChargedUsd: 0.05
        });
    } catch (error) {
        res.status(500).json({ error: "Ni mogoce doseci ciljne strani ali pa je dostop blokiran." });
    }
});

// 5. MODUL: Kripto in financni podatki (Placljiv endpoint)
app.get('/api/crypto', async (req, res) => {
    trackRevenue(0.02); // Zaracunamo 0.02$

    try {
        // Brezplacen javni klic na CoinGecko za trenutne cene kriptovalut
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
        
        res.json({
            status: "success",
            marketData: response.data,
            timestamp: new Date(),
            costChargedUsd: 0.02
        });
    } catch (error) {
        res.status(500).json({ error: "Napaka pri pridobivanju financnih podatkov." });
    }
});

// 6. MODUL: Statistika zaslužka
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