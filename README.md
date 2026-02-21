# National Tax Law Associates - Backend API

A robust Node.js/Express backend API for the National Tax Law Associates website, providing authentication, blog management, consultation requests, and newsletter subscriptions.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Cloudinary** - File storage
- **Multer** - File upload handling

## Prerequisites

- Node.js >= 18.x
- MongoDB (local or Atlas)
- Cloudinary account

## Installation

1. Clone the repository
2. Navigate to backend folder:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
5. Update `.env` with your credentials

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/national-tax-law
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Seed Database
```bash
npm run seed
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Blogs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blogs` | Get all blogs |
| GET | `/api/blogs/:id` | Get single blog |
| POST | `/api/blogs` | Create blog (Admin) |
| PUT | `/api/blogs/:id` | Update blog (Admin) |
| DELETE | `/api/blogs/:id` | Delete blog (Admin) |

### Consultations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/consultations` | Get all (Admin) |
| GET | `/api/consultations/:id` | Get single (Admin) |
| POST | `/api/consultations` | Submit request |
| PUT | `/api/consultations/:id` | Update status (Admin) |
| DELETE | `/api/consultations/:id` | Delete (Admin) |

### Newsletter
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/newsletter` | Get subscribers (Admin) |
| POST | `/api/newsletter/subscribe` | Subscribe |
| DELETE | `/api/newsletter/:id` | Unsubscribe (Admin) |

## Project Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── cloudinary.js      # Cloudinary config
├── controllers/
│   ├── authController.js
│   ├── blogController.js
│   ├── consultationController.js
│   └── newsletterController.js
├── middleware/
│   ├── auth.js            # JWT authentication
│   └── errorHandler.js    # Error handling
├── models/
│   ├── User.js
│   ├── Blog.js
│   ├── Consultation.js
│   └── Newsletter.js
├── routes/
│   ├── auth.js
│   ├── blogs.js
│   ├── consultations.js
│   └── newsletter.js
├── server.js              # Express app entry
├── seeder.js              # Database seeder
└── package.json
```

## Default Admin Credentials

After running `npm run seed`:
- **Email:** admin@nationaltaxlaw.com
- **Password:** admin123

## License

MIT
