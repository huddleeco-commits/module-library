/**
 * CardFlow Wizard Template Server
 * Express server with CardFlow AI assistant endpoint
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { registerCardFlowRoutes } = require('./lib/services/cardflow-api.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Register CardFlow AI routes
registerCardFlowRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'cardflow-wizard' });
});

app.listen(PORT, () => {
  console.log(`CardFlow Wizard server running on port ${PORT}`);
});

module.exports = app;
