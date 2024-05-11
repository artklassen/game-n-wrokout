// app.js or server.js
const express = require('express');
const setupDatabase = require('./setupDatabase.js');

const app = express();
const PORT = process.env.PORT || 3001;

setupDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to setup database:', err);
});
