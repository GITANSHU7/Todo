const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
app.use(cors());
app.use(bodyParser.json());

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

app.use('/user', userRoutes)
app.use('/auth', authRoutes)
app.use('/todos', todoRoutes)

app.get('/', (req, res) => {
    res.send('Welcome to APIs World');
});


//save to database
const port = process.env.PORT || 8000;
// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
