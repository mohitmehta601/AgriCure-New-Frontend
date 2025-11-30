# AgriCure Backend Setup Guide (MongoDB + JWT)

## Overview

This guide explains how to set up the Node.js/Express backend with MongoDB and JWT authentication to replace Supabase.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Backend Structure

```
agricure-backend/
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── models/
│   │   ├── User.js           # User model
│   │   ├── Farm.js           # Farm model
│   │   ├── SoilData.js       # Soil data model
│   │   └── Recommendation.js # Fertilizer recommendation model
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── users.js          # User management routes
│   │   ├── farms.js          # Farm CRUD routes
│   │   └── recommendations.js # Recommendation routes
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   └── server.js             # Express server
├── package.json
└── .env
```

## Installation Steps

### 1. Create Backend Directory

```bash
mkdir agricure-backend
cd agricure-backend
npm init -y
```

### 2. Install Dependencies

```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv cors body-parser
npm install --save-dev nodemon
```

### 3. Environment Variables (.env)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/agricure
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4. Database Configuration (src/config/database.js)

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

### 5. User Model (src/models/User.js)

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

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

### 6. Farm Model (src/models/Farm.js)

```javascript
const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ["hectares", "acres", "bigha"],
      required: true,
    },
    cropType: String,
    soilType: String,
    location: String,
    latitude: Number,
    longitude: Number,
    soilData: mongoose.Schema.Types.Mixed,
    sowingDate: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Farm", farmSchema);
```

### 7. Recommendation Model (src/models/Recommendation.js)

```javascript
const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
    },
    fieldName: String,
    fieldSize: Number,
    fieldSizeUnit: String,
    cropType: String,
    soilType: String,
    soilPh: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    temperature: Number,
    humidity: Number,
    soilMoisture: Number,
    primaryFertilizer: String,
    secondaryFertilizer: String,
    mlPrediction: String,
    confidenceScore: Number,
    applicationRate: Number,
    applicationRateUnit: String,
    applicationMethod: String,
    applicationTiming: String,
    recommendations: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ["pending", "applied", "scheduled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
```

### 8. Auth Middleware (src/middleware/auth.js)

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
```

### 9. Auth Routes (src/routes/auth.js)

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

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Validate product ID (implement your logic here)
    // For now, we'll accept any productId

    // Create user
    const user = new User({
      email,
      password,
      fullName,
      productId,
      farmLocation,
      phoneNumber,
    });

    await user.save();

    // Generate token
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
        farmSize: user.farmSize,
        farmSizeUnit: user.farmSizeUnit,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
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
        farmSize: user.farmSize,
        farmSizeUnit: user.farmSizeUnit,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 10. Farm Routes (src/routes/farms.js)

```javascript
const express = require("express");
const Farm = require("../models/Farm");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.use(authMiddleware);

// Create farm
router.post("/", async (req, res) => {
  try {
    const farm = new Farm({
      ...req.body,
      userId: req.user._id,
    });
    await farm.save();
    res.status(201).json(farm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's farms
router.get("/user/:userId", async (req, res) => {
  try {
    const farms = await Farm.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(farms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get farm by ID
router.get("/:id", async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }
    res.json(farm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update farm
router.put("/:id", async (req, res) => {
  try {
    const farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }
    res.json(farm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete farm
router.delete("/:id", async (req, res) => {
  try {
    const farm = await Farm.findByIdAndDelete(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }
    res.json({ message: "Farm deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 11. Main Server File (src/server.js)

```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/database");

const authRoutes = require("./routes/auth");
const farmRoutes = require("./routes/farms");
// Add other routes as needed

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/farms", farmRoutes);
// Add other routes

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

### 12. Package.json Scripts

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

## Running the Backend

```bash
# Development
npm run dev

# Production
npm start
```

## Frontend Environment Setup

Update your `.env` file in the frontend:

```env
VITE_MONGODB_URI=mongodb://localhost:27017/agricure
VITE_API_URL=http://localhost:3000/api
VITE_JWT_SECRET=your_jwt_secret_key_here
VITE_THINGSPEAK_API_KEY=your_thingspeak_api_key
VITE_THINGSPEAK_CHANNEL_ID=your_channel_id
```

## Testing the API

### Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "productId": "PROD123",
    "farmLocation": "Maharashtra, India"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## Migration Notes

1. **Data Migration**: You'll need to export data from Supabase and import into MongoDB
2. **Real-time Features**: For real-time updates (similar to Supabase subscriptions), consider using Socket.IO or Server-Sent Events
3. **File Storage**: If using file storage, consider AWS S3, Cloudinary, or local storage
4. **Backup**: Set up MongoDB backup strategy (MongoDB Atlas provides automated backups)

## Security Best Practices

1. Use strong JWT secrets in production
2. Implement rate limiting
3. Add input validation (use express-validator)
4. Enable HTTPS in production
5. Use helmet.js for security headers
6. Implement proper error handling without exposing sensitive data
