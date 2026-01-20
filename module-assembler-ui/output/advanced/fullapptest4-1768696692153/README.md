# fullapptest4 Loyalty Program

A comprehensive loyalty program application that allows customers to earn and redeem points across multiple tiers with exclusive rewards and benefits.

## Features

### Customer Features
- **Points System**: Earn 1 point per dollar spent
- **Multi-Tier Program**: Bronze, Silver, Gold, and Platinum tiers with increasing multipliers
- **Rewards Catalog**: Redeem points for discounts, free items, and VIP access
- **Profile Management**: Track points balance, tier status, and transaction history
- **Mobile-Responsive**: Optimized for all devices

### Admin Features
- **Customer Management**: View and manage customer accounts
- **Points Administration**: Add/remove points, adjust balances
- **Rewards Management**: Configure rewards and redemption options
- **Analytics Dashboard**: Track program performance and engagement
- **Tier Management**: Monitor tier distributions and upgrades

### Tier System
- **Bronze** (0+ points): 1x multiplier
- **Silver** (500+ points): 1.25x multiplier
- **Gold** (2000+ points): 1.5x multiplier
- **Platinum** (5000+ points): 2x multiplier

### Available Rewards
- $5 Off (100 points)
- $10 Off (200 points)
- Free Item (500 points)
- VIP Access (1000 points)

## Prerequisites

- Node.js 18+ and npm
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullapptest4-loyalty
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Start backend server** (in another terminal)
   ```bash
   npm run dev:server
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000/api

## Production Build

```bash
npm run build
npm start
```

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Using Docker

```bash
# Build image
docker build -t fullapptest4-loyalty .

# Run container
docker run -d \
  --name loyalty-app \
  -p 3000:3000 \
  -v loyalty_data:/app/data \
  fullapptest4-loyalty
```

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/logout` - Logout

### Customer Endpoints
- `GET /api/customer/profile` - Get customer profile
- `PUT /api/customer/profile` - Update profile
- `GET /api/customer/points` - Get points balance
- `GET /api/customer/transactions` - Get transaction history
- `GET /api/customer/tier` - Get current tier info

### Points Management
- `POST /api/points/earn` - Earn points from purchase
- `POST /api/points/redeem` - Redeem points for rewards
- `GET /api/points/history` - Points transaction history

### Rewards
- `GET /api/rewards` - List available rewards
- `POST /api/rewards/redeem/:id` - Redeem specific reward
- `GET /api/rewards/history` - Redemption history

### Admin Endpoints
- `GET /api/admin/customers` - List all customers
- `GET /api/admin/customers/:id` - Get customer details
- `POST /api/admin/points/adjust` - Adjust customer points
- `GET /api/admin/analytics` - Get program analytics
- `POST /api/admin/rewards` - Create/update rewards

### Tiers
- `GET /api/tiers` - List all tiers
- `GET /api/tiers/current` - Get user's current tier
- `GET /api/tiers/progress` - Get tier progression info

## Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `PORT` | Server port | 3000 |
| `JWT_SECRET` | JWT signing secret | Required |
| `ADMIN_EMAIL` | Admin email | admin@example.com |
| `ADMIN_PASSWORD` | Admin password | admin123 |
| `DATABASE_PATH` | SQLite database path | ./data/loyalty.db |
| `BUSINESS_NAME` | Business name | fullapptest4 |
| `POINTS_CURRENCY` | Points currency name | points |
| `EARN_RATE` | Points per dollar | 1 |

## Database Schema

The application uses SQLite with the following main tables:
- `users` - Customer and admin accounts
- `points_transactions` - Points earning/spending records
- `rewards` - Available rewards catalog
- `redemptions` - Reward redemption history
- `tiers` - Tier configuration

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Rate limiting (production)

## Performance

- SQLite for fast local database operations
- Efficient indexing on customer and transaction queries
- Caching of tier calculations
- Optimized API responses

## Support

For issues and questions:
1. Check the API documentation above
2. Review environment configuration
3. Check application logs
4. Verify database connectivity

## License

MIT License - see LICENSE file for details.