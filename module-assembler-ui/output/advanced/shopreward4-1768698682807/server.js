const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/points', require('./routes/points'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/qr', require('./routes/qr'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'ShopReward4' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ShopReward4 server running on port ${PORT}`);
});