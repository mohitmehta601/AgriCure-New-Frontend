# 🌱 AgriCure - Smart Fertilizer Recommendation System

**AGRICURE = Productivity + Profit + Planet**

An IoT-powered, AI/ML-driven system that provides **real-time, precise, and crop-specific fertilizer recommendations** to farmers. Built with MongoDB and JWT authentication for full data control and scalability.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Solution](#solution)
4. [Tech Stack](#tech-stack)
5. [Features](#features)
6. [Quick Start](#quick-start)
7. [Backend Setup](#backend-setup)
8. [API Documentation](#api-documentation)
9. [Troubleshooting](#troubleshooting)
10. [Deployment](#deployment)

---

## 🎯 Overview

The **Smart Fertilizer Recommendation System** integrates **IoT sensors + Machine Learning** to deliver **real-time advisory** to farmers.

1. IoT Sensors measure soil NPK, moisture, pH, temperature, and humidity
2. ML algorithms compare real-time readings with ideal crop requirements
3. The system outputs the exact fertilizer type and quantity needed

**Key Benefits**:

- Boost yield by 20–30%
- Reduce input costs via precision delivery
- Promote climate-smart, sustainable practices

---

## 🚜 Problem Statement

Farmers often lack **accurate information** about the quality and quantity of fertilizers required for their crops.

This leads to:

- Nutrient imbalance in soils
- Reduced crop yield and soil degradation
- Environmental pollution from excess fertilizer use
- Rising production costs (~18% for small farmers)
- Inefficient farming practices causing economic losses

> **Fact:** Over 40–60% of applied nitrogen and phosphorus never reaches plants — it pollutes waterways or escapes as greenhouse gases.

---

## 💡 Solution

### System Workflow

```
Real-time sensing → Cloud Processing → ML Prediction → Farmer Dashboard → Precision Fertilizer Delivery
```

### Target Users

- Smallholder farmers (1–10+ hectares)
- Commercial farms optimizing fertilizer usage
- Agribusinesses & cooperatives

### Market & Impact

- 14 crore hectares cultivable land in India
- ₹31K Cr projected Agri-Tech market by 2033
- 70% soils nutrient-deficient
- Potential to boost yield by 20–30% and lower cost significantly

---

## 🖥️ Tech Stack

**Frontend:**

- React.js + TypeScript
- Tailwind CSS
- Axios for API calls
- JWT for authentication

**Backend:**

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- RESTful APIs

**Machine Learning:**

- Python + Scikit-learn
- Flask/FastAPI

**IoT & Cloud:**

- ThingSpeak – IoT Data ingestion
- MongoDB Atlas (optional cloud database)

**Hardware:**

- ESP32
- NPK Sensor (RS485)
- Soil Moisture Sensor
- DHT11
- SH1106 OLED

---

## ✨ Features

- 🌐 Multi-language support
- ⚡ Instant sensing
- ☁ Climate-smart adaptation
- 📈 Data-driven forecasting
- 🎯 Precision delivery (Variable Rate Application)
- 🖥 Rich dashboard with alerts
- 🔐 Secure JWT authentication
- 📊 Farm management system
- 📝 Detailed fertilizer recommendations
- 📱 Real-time IoT data integration

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- Git

### 1. Clone and Install Frontend

```powershell
cd "p:\Latest AgriCure\Frontend"
npm install
```

### 2. Set Up Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_JWT_SECRET=your_jwt_secret_key_here
VITE_THINGSPEAK_API_KEY=your_thingspeak_api_key
VITE_THINGSPEAK_CHANNEL_ID=your_channel_id
```

### 3. Set Up Backend (Automated)

Run the automated setup script:

```powershell
# Windows
.\setup-backend.ps1

# Linux/Mac
chmod +x setup-backend.sh
./setup-backend.sh
```

This will:

- Create `../Backend` directory
- Install all dependencies
- Generate all configuration files
- Set up MongoDB connection
- Create models and routes

### 4. Start MongoDB

**Windows:**

```powershell
net start MongoDB
```

**Mac:**

```bash
brew services start mongodb-community
```

**Linux:**

```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas** (cloud database):

- Sign up at https://www.mongodb.com/atlas
- Create a free cluster
- Get connection string
- Update `.env` with Atlas URI

### 5. Start Services

**Terminal 1 - Backend:**

```powershell
cd ..\Backend
npm run dev
```

**Terminal 2 - Frontend:**

```powershell
cd "p:\Latest AgriCure\Frontend"
npm run dev
```

### 6. Access Application

Open http://localhost:5173 in your browser

---

## 🔧 Backend Setup

### Manual Backend Setup

If you prefer manual setup or the automated script doesn't work:

### 1. Create Backend Directory

```powershell
mkdir ..\Backend
cd ..\Backend
npm init -y
```

### 2. Install Dependencies

```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv cors body-parser
npm install --save-dev nodemon
```

### 3. Backend Structure

```
Backend/
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── models/
│   │   ├── User.js           # User model
│   │   ├── Farm.js           # Farm model
│   │   └── Recommendation.js # Recommendation model
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── users.js          # User routes
│   │   ├── farms.js          # Farm routes
│   │   └── recommendations.js # Recommendation routes
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   └── server.js             # Express server
├── package.json
└── .env
```

### 4. Environment Variables

Create `.env` in Backend directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/agricure
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 5. Database Configuration

**src/config/database.js:**

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 6. User Model

**src/models/User.js:**

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: true,
    },
    farmLocation: String,
    phoneNumber: String,
    farmSize: Number,
    farmSizeUnit: {
      type: String,
      enum: ["hectares", "acres", "bigha"],
      default: "hectares",
    },
    productId: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

### 7. Auth Routes

**src/routes/auth.js:**

```javascript
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Sign up
router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName, productId, farmLocation, phoneNumber } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = new User({
      email,
      password,
      fullName,
      productId,
      farmLocation,
      phoneNumber,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        farmLocation: user.farmLocation,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        farmLocation: user.farmLocation,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 8. Main Server File

**src/server.js:**

```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/database");

const authRoutes = require("./routes/auth");
const farmRoutes = require("./routes/farms");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/farms", farmRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 9. Update package.json

Add scripts:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

---

## 🗄️ Database Architecture

**AgriCure uses MongoDB as its primary and only database** for all data storage and management.

### Why MongoDB?

- ✅ **Full Control:** Self-hosted or cloud (MongoDB Atlas)
- ✅ **Cost-Effective:** Free for self-hosted, flexible pricing for cloud
- ✅ **Scalability:** Independent horizontal scaling
- ✅ **Flexibility:** Schema-less design for evolving data models
- ✅ **Performance:** Fast queries with proper indexing
- ✅ **No Vendor Lock-in:** Open-source and portable

### Collections

- **users** - User accounts and authentication
- **pendingusers** - Temporary storage for OTP verification
- **otps** - Email OTP verification codes (with TTL)
- **farms** - Farm information and IoT sensor data
- **recommendations** - Fertilizer recommendation history
- **productkeys** - Product key validation for registration

### Authentication

**JWT-based authentication** provides secure, stateless authentication:

1. User signs up → Backend creates User in MongoDB
2. JWT token generated and returned
3. Token stored in localStorage
4. Token sent with every API request (Authorization header)
5. Token validated on backend middleware

### Field Naming Convention

All database fields use **camelCase**:

| Field         | Type     | Example            |
| ------------- | -------- | ------------------ |
| `userId`      | ObjectId | MongoDB reference  |
| `fullName`    | String   | "John Doe"         |
| `phoneNumber` | String   | "+911234567890"    |
| `createdAt`   | Date     | ISO 8601 timestamp |
| `updatedAt`   | Date     | ISO 8601 timestamp |

See `Backend/MONGODB_SETUP.md` for complete schema documentation.

---

## 📚 API Documentation

### Authentication Endpoints

#### Sign Up

```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "productId": "PROD123",
  "farmLocation": "Maharashtra, India",
  "phoneNumber": "+91-9876543210"
}

Response: {
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "fullName": "John Doe",
    ...
  }
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "token": "jwt_token_here",
  "user": { ... }
}
```

### User Endpoints

```
GET    /api/users/:id       - Get user profile
PUT    /api/users/:id       - Update user profile
```

### Farm Endpoints

```
POST   /api/farms                - Create new farm
GET    /api/farms/user/:userId   - Get all farms for user
GET    /api/farms/:id            - Get farm by ID
PUT    /api/farms/:id            - Update farm
DELETE /api/farms/:id            - Delete farm
```

**Example - Create Farm:**

```
POST /api/farms
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Main Field",
  "size": 5.5,
  "unit": "hectares",
  "cropType": "Wheat",
  "soilType": "Loamy",
  "location": "Pune, Maharashtra",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```

### Recommendation Endpoints

```
POST   /api/recommendations                - Create recommendation
GET    /api/recommendations/user/:userId   - Get user's recommendations
GET    /api/recommendations/:id            - Get recommendation by ID
PATCH  /api/recommendations/:id            - Update recommendation status
DELETE /api/recommendations/:id            - Delete recommendation
```

### Testing the API

**Windows PowerShell:**

```powershell
# Test Health
Invoke-WebRequest -Uri http://localhost:3000/api/health

# Test Signup
$body = @{
    email = "test@example.com"
    password = "test123"
    fullName = "Test User"
    productId = "PROD001"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/auth/signup `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**cURL:**

```bash
# Test Health
curl http://localhost:3000/api/health

# Test Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "fullName": "Test User",
    "productId": "PROD001"
  }'
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Problem:** Cannot connect to MongoDB

**Solutions:**

- Check if MongoDB is running: `mongod` or `net start MongoDB`
- Verify connection string in `.env`
- Check port 27017 is not blocked
- For MongoDB Atlas, check network access settings

### CORS Errors

**Problem:** Frontend cannot connect to backend

**Solution:** Update CORS configuration in `src/server.js`:

```javascript
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

### 401 Unauthorized

**Problem:** API returns 401 errors

**Solutions:**

- Check if JWT token is in localStorage (DevTools → Application)
- Verify token hasn't expired
- Check if Authorization header is being sent
- Verify JWT_SECRET matches between frontend and backend

### Port Already in Use

**Problem:** Cannot start backend on port 3000

**Solution:**

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Or change port in backend .env
PORT=3001
```

### Module Not Found

**Problem:** Cannot find module 'express' or other dependencies

**Solution:**

```bash
cd Backend
npm install
```

---

## 🌟 Key Features Explained

### Real-Time Soil Analysis

- Integrates with ThingSpeak for live IoT data
- Displays current NPK levels, moisture, pH
- Updates every few seconds
- Visual charts and indicators

### Fertilizer Recommendations

- ML-powered predictions
- Considers crop type, soil conditions, weather
- Provides specific fertilizer types and quantities
- Application timing and methods

### Farm Management

- Multiple farm support
- Track different fields
- Store soil data history
- Monitor crop progress

### Multi-Language Support

- English, Hindi, Marathi
- Easy language switching
- Localized content

---

## 🔐 Security Best Practices

### Production Checklist

- [ ] Use strong JWT secrets (minimum 32 characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Implement rate limiting
- [ ] Add input validation (express-validator)
- [ ] Use helmet.js for security headers
- [ ] Enable MongoDB authentication
- [ ] Set up CORS properly
- [ ] Never commit `.env` files
- [ ] Use environment variables for all secrets
- [ ] Implement refresh tokens
- [ ] Add logging and monitoring
- [ ] Set up automated backups

---

## 🚀 Deployment

### Backend Deployment

**Option 1: Heroku**

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create agricure-backend

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

**Option 2: DigitalOcean**

1. Create a Droplet (Ubuntu 22.04)
2. SSH into droplet
3. Install Node.js and MongoDB
4. Clone repository
5. Set up PM2 for process management
6. Configure Nginx as reverse proxy

**Option 3: AWS EC2**

Similar to DigitalOcean with AWS services

### Frontend Deployment

**Vercel:**

```bash
npm install -g vercel
vercel
```

**Netlify:**

```bash
npm run build
# Upload dist/ folder to Netlify
```

Update `.env` with production API URL:

```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## 📊 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  fullName: String,
  farmLocation: String,
  phoneNumber: String,
  farmSize: Number,
  farmSizeUnit: String,
  productId: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Farms Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: String,
  size: Number,
  unit: String,
  cropType: String,
  soilType: String,
  location: String,
  latitude: Number,
  longitude: Number,
  soilData: Mixed,
  sowingDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Recommendations Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  farmId: ObjectId (ref: Farm),
  fieldName: String,
  cropType: String,
  soilType: String,
  soilPh: Number,
  nitrogen: Number,
  phosphorus: Number,
  potassium: Number,
  temperature: Number,
  humidity: Number,
  primaryFertilizer: String,
  secondaryFertilizer: String,
  mlPrediction: String,
  confidenceScore: Number,
  applicationRate: Number,
  applicationMethod: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 📞 Support

For issues or questions:

1. Check this README
2. Review API documentation
3. Check browser console for errors
4. Verify backend logs
5. Test API endpoints with Postman/cURL

---

## 🎯 Roadmap

### Phase 1 (Current)

- ✅ Basic authentication
- ✅ Farm management
- ✅ Fertilizer recommendations
- ✅ Real-time IoT integration

### Phase 2 (Next)

- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Weather integration
- [ ] Crop disease detection

### Phase 3 (Future)

- [ ] Marketplace integration
- [ ] Community features
- [ ] AI chatbot for farmers
- [ ] Drone integration

---

## 💡 Key Benefits

| Feature            | AgriCure Advantage                              |
| ------------------ | ----------------------------------------------- |
| **Cost**           | Free (self-hosted) or flexible cloud pricing    |
| **Control**        | Full control over data and infrastructure       |
| **Customization**  | Unlimited - modify as needed                    |
| **Vendor Lock-in** | None - open-source technologies                 |
| **Data Location**  | Your choice (local or cloud)                    |
| **Scalability**    | Independent horizontal scaling with MongoDB     |
| **Performance**    | Optimized queries with indexing                 |
| **Security**       | JWT-based authentication with custom middleware |

---

## 📚 Learning Resources

- **MongoDB:** https://www.mongodb.com/docs/manual/
- **Express.js:** https://expressjs.com/
- **JWT:** https://jwt.io/introduction
- **Mongoose:** https://mongoosejs.com/docs/
- **React:** https://react.dev/

---

## ✨ Acknowledgments

- ThingSpeak for IoT platform
- MongoDB for database
- React team for amazing framework
- All contributors and farmers using this system

---

**Built with ❤️ for Indian Farmers**

_Last Updated: December 8, 2025_
_Version: 2.0.0_
_Database: MongoDB with JWT Authentication_
