const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

let stats = {
    totalRequests: 0,
    paidRequests: 0,
    revenueUsd: 0.00
};

app.get('/', (req, res) => {
    res.json({ 
        status: "ok", 
        message: "API Pijavka All-in-One Proxy deluje.",
        endpoints: [
            "/api/ai-wrapper (Zahteve za AI/besedilo)",
            "/api/scraping (Sledenje spletnim podatkom)",
            "/api/crypto (Kripto in financni podatki)",
            "/stats (Statistika zaslužka)"
        ]
    });
});

app.get('/stats', (req, res) => {
    res.json({ status: "success", stats });
});

function requireMicroPayment(req, res, next) {
    stats.totalRequests++;
    const authHeader = req.headers['authorization'];

    if (!authHeader || authHeader !== 'Bearer placano-10-centov') {
        return res.status(402).json({
            error: "Payment Required",
            message: "Za dostop do tega proxa je obvezno mikro-placilo (0.10$). Pošlji veljaven žeton.",
            paymentMethodsAccepted: ["LNURL / Lightning Network", "Stripe Metered"]
        });
    }

    stats.paidRequests++;
    stats.revenueUsd += 0.10;
    next();
}

app.post('/api/ai-wrapper', requireMicroPayment, async (req, res) => {
    try {
        const { prompt } = req.body;
        res.json({
            module: "AI Wrapper",
            status: "success",
            input: prompt || "Brez vhoda",
            aiResponse: "To je simuliran AI odgovor preko tvojega proxy strežnika."
        });
    } catch (error) {
        res.status(500).json({ error: "Napaka v AI modulu", details: error.message });
    }
});

app.get('/api/scraping', requireMicroPayment, async (req, res) => {
    try {
        const response = await axios.get('https://randomuser.me/api/');
        res.json({
            module: "Web Scraping & Data Aggregator",
            status: "success",
            scrapedData: response.data.results[0]
        });
    } catch (error) {
        res.status(500).json({ error: "Napaka pri zajemu podatkov", details: error.message });
    }
});

app.get('/api/crypto', requireMicroPayment, async (req, res) => {
    try {
        const response = await axios.get('https://coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
        res.json({
            module: "Crypto & Financial Feed",
            status: "success",
            marketPrices: response.data
        });
    } catch (error) {
        res.status(500).json({ error: "Napaka pri pridobivanju financnih podatkov", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Strežnik tece na vratih ${PORT}`);
});