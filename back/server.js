require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Enable CORS
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/ahmed')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
const scheduleRoutes = require('./routes/scheduleRoutes');
const classRoutes = require('./routes/classRoutes');
const teachersRoutes = require('./routes/teachersRoutes');
const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');

app.use('/api', scheduleRoutes);
app.use('/api/classes', classRoutes);
app.use('/api', teachersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Node.js backend!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
