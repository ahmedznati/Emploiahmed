const express = require('express');
const cors = require('cors');

// Import route modules
const teachersRoutes = require('./routes/teachersRoutes');
const classesRoutes = require('./routes/classRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/teachers', teachersRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/schedule', scheduleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
