const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();

require('dotenv').config();

// Choose the correct database URL based on the environment
const databaseUrl = process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_LOCAL;

console.log('Database URL:', databaseUrl);

app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

// Setup PostgreSQL connection using the appropriate URL
const pool = new Pool({
    connectionString: databaseUrl
});

// Log connection and test simple query
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log(result.rows); // This should log the current timestamp
    });
});

console.log('hello ebana');

app.post('/api/form', async (req, res) => {
    try {
        const { username, game, exerciseName, exerciseAmount } = req.body;
        const result = await pool.query(
            'INSERT INTO games (username, game, exercise_name, exercise_amount, date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [username, game, exerciseName, exerciseAmount]
        );

        res.status(200).json({ message: 'Data saved successfully', data: result.rows[0] });
    } catch (error) {
        console.error('Failed to save data:', error);
        res.status(500).json({ message: 'Failed to process form data' });
    }
});

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendGames = async () => {
        const { rows } = await pool.query('SELECT * FROM games');
        const data = JSON.stringify(rows);
        res.write(`data: ${data}\n\n`);
    };

    sendGames();
    const interval = setInterval(sendGames, 5000);

    res.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
