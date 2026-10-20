const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

// Omogoci branje JSON podatkov in streženje staticnih datotek (HTML, slike, css)
app.use(express.json());
app.use(express.static(__dirname));

let stats = {
    totalRequests: 0,
    paidRequests: 0,
    revenueUsd: 0.00
};

// Osnovna pot, ki zdaj vrne tvojo spletno stran index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Pomožna pot za pregled stanja API-ja (ce želiš JSON)
app.get('/api-status', (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Strežnik tece na vratih ${PORT}`);
});