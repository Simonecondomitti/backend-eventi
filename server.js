require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const PORT = process.env.PORT || 5000;

// ✅ Test connessione al database
(async () => {
  try {
    const client = await pool.connect();
    console.log("🟢 Connessione riuscita al database!");
    client.release();
  } catch (err) {
    console.error("🔴 Errore connessione al database:", err);
  }
})();

// ✅ Route di test per verificare che il server funzioni
app.get('/', (req, res) => {
  res.send("API Funzionante 🚀");
});

// ✅ Route per ottenere tutti gli eventi
app.get('/eventi', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM eventi ORDER BY data ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Errore nel recupero degli eventi:", err);
    res.status(500).send('Errore interno al server');
  }
});

// ✅ Route per creare un nuovo evento
app.post('/eventi', async (req, res) => {
  const { titolo, descrizione, data, immagine } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO eventi (titolo, descrizione, data, immagine) VALUES ($1, $2, $3, $4) RETURNING *',
      [titolo, descrizione, data, immagine]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Errore nella creazione dell’evento:", err);
    res.status(500).send('Errore interno al server');
  }
});

// ✅ Avvio del server Express
app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
});
