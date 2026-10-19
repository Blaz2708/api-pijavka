const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/data', (req, res) => {
    res.json({ status: 'ok', message: 'Sistem deluje, caka na zahteve.' });
});

app.listen(PORT, () => {
    console.log('Strežnik tece na vratih ' + PORT);
});
