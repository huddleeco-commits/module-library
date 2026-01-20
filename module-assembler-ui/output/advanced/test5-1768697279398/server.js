import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import pointsRoutes from './routes/points.js';
import rewardsRoutes from './routes/rewards.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', business: 'test5', currency: 'points' });
});

app.listen(PORT, () => {
  console.log(`Loyalty Program API running on port ${PORT}`);
});