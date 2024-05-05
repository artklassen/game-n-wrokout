const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/game-n-workout');


// MongoDB Model
const Game = mongoose.model('Game', new mongoose.Schema({
    user: String,
    game: String,
    exerciseName: String,
    exerciseAmount: Number,
    date: { type: Date, default: Date.now }
}));
console.log('hello ebana')

app.post('/api/form', async (req, res) => {
    try {
        // Create a new game instance using data from the request body
        const newGame = new Game({
            user: req.body.user,
            game: req.body.game,
            exerciseName: req.body.exerciseName,
            exerciseAmount: req.body.exerciseAmount
        });

        await newGame.save();

        res.status(200).json({ message: 'Data saved successfully', data: newGame });
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
        const data = JSON.stringify(await Game.find());
        res.write(`data: ${data}\n\n`);
    };

    sendGames();
    const interval = setInterval(sendGames, 5000);

    res.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});

const PORT = process.env.PORT || 3002; // Fallback to 3001 if no environment variable is set
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
