# SparkFund - Crowdfunding Platform (Server)

REST API for the SparkFund crowdfunding platform. Built with Express.js, MongoDB, and Better Auth.

## 🔗 Live API
[click here](https://sparkfund-server-3y5w.onrender.com)

## 🛠️ Tech Stack

- Node.js
- Express.js 5
- MongoDB + Mongoose
- Better Auth
- Stripe
- MongoDB Native Driver

## 📦 Installation

```bash
git clone https://github.com/Tamim379ta/SparkFund-server.git
cd SparkFund-server
npm install
```

Create `.env`:
```env
MONGO_URI=your_mongodb_uri
CLIENT_URL=http://localhost:3000
PORT=5000
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:5000
STRIPE_SECRET_KEY=your_stripe_secret
```

```bash
npm run dev
```

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/sign-up/email | Register |
| POST | /api/auth/sign-in/email | Login |
| POST | /api/auth/sign-out | Logout |
| GET | /api/auth/get-session | Get session |

### Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/campaigns | Get all active campaigns |
| GET | /api/campaigns/:id | Get single campaign |
| POST | /api/campaigns | Create campaign (Creator) |
| PATCH | /api/campaigns/:id | Update campaign (Creator) |
| DELETE | /api/campaigns/:id | Delete campaign (Creator) |
| GET | /api/campaigns/creator/my-campaigns | Get my campaigns (Creator) |
| GET | /api/campaigns/admin/all | Get all campaigns (Admin) |
| PATCH | /api/campaigns/:id/status | Update campaign status (Admin) |
| GET | /api/campaigns/top-funded | Get top 6 funded campaigns |

### Contributions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/contributions | Create contribution (Supporter) |
| GET | /api/contributions/my-contributions | Get my contributions (Supporter) |
| GET | /api/contributions/campaign-contributions | Get campaign contributions (Creator) |
| PATCH | /api/contributions/:id/status | Approve or reject (Creator) |

### Withdrawals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/withdrawals | Request withdrawal (Creator) |
| GET | /api/withdrawals/my-withdrawals | Get my withdrawals (Creator) |
| GET | /api/withdrawals/total-raised | Get total raised (Creator) |
| GET | /api/withdrawals/admin/all | Get all withdrawals (Admin) |
| PATCH | /api/withdrawals/:id/approve | Approve withdrawal (Admin) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Get all users (Admin) |
| DELETE | /api/users/:id | Delete user (Admin) |
| PATCH | /api/users/:id/role | Update user role (Admin) |
| GET | /api/users/admin/stats | Get admin stats |
| GET | /api/users/supporter/stats | Get supporter stats |
| GET | /api/users/creator/stats | Get creator stats |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments/create-checkout-session | Create Stripe session (Supporter) |
| POST | /api/payments/verify | Verify payment (Supporter) |
| GET | /api/payments/history | Get payment history |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Get notifications |
| PATCH | /api/notifications/read-all | Mark all as read |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reports | Report a campaign (Supporter) |
| GET | /api/reports | Get all reports (Admin) |
| PATCH | /api/reports/:id/suspend | Suspend campaign (Admin) |
| PATCH | /api/reports/:id/dismiss | Dismiss report (Admin) |

## 📁 Project Structure

```
controllers/    # Business logic
models/         # Mongoose schemas
routes/         # Express routes
middlewares/    # Auth & role middleware
config/
  db.js         # MongoDB connection
  auth.js       # Better Auth config
index.js        # Entry point
```
