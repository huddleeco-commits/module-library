const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/points', require('./routes/points'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/qr', require('./routes/qr'));

app.get('/', (req, res) => {
  res.json({ message: 'ShopRewardTest Loyalty System API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});