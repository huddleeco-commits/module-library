const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/points', require('./routes/points'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/qr', require('./routes/qr'));

app.use((err, req, res, next) => {
  res.status(500).json({error: 'Server error'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));