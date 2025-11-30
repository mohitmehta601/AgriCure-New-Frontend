#!/bin/bash

# AgriCure Backend Quick Setup Script
# This script creates the basic backend structure

echo "🌱 AgriCure Backend Setup Starting..."

# Create backend directory
mkdir -p ../Backend
cd ../Backend

echo "📦 Initializing Node.js project..."
npm init -y

echo "📥 Installing dependencies..."
npm install express mongoose bcryptjs jsonwebtoken dotenv cors body-parser
npm install --save-dev nodemon

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p src/config
mkdir -p src/models
mkdir -p src/routes
mkdir -p src/middleware

# Create .env file
echo "📝 Creating .env file..."
cat > .env << 'EOF'
PORT=3000
MONGODB_URI=mongodb://localhost:27017/agricure
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
EOF

# Create database config
echo "📝 Creating database configuration..."
cat > src/config/database.js << 'EOF'
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
EOF

# Create User model
echo "📝 Creating User model..."
cat > src/models/User.js << 'EOF'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    required: true
  },
  farmLocation: String,
  phoneNumber: String,
  farmSize: Number,
  farmSizeUnit: {
    type: String,
    enum: ['hectares', 'acres', 'bigha'],
    default: 'hectares'
  },
  productId: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
EOF

# Create auth middleware
echo "📝 Creating auth middleware..."
cat > src/middleware/auth.js << 'EOF'
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
EOF

# Create auth routes
echo "📝 Creating auth routes..."
cat > src/routes/auth.js << 'EOF'
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, productId, farmLocation, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      email,
      password,
      fullName,
      productId,
      farmLocation,
      phoneNumber
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
        farmSize: user.farmSize,
        farmSizeUnit: user.farmSizeUnit,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
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
        farmSize: user.farmSize,
        farmSizeUnit: user.farmSizeUnit,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
EOF

# Create server.js
echo "📝 Creating server.js..."
cat > src/server.js << 'EOF'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
EOF

# Update package.json with scripts
echo "📝 Updating package.json scripts..."
npm pkg set scripts.start="node src/server.js"
npm pkg set scripts.dev="nodemon src/server.js"

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure MongoDB is running:"
echo "   - Local: mongod"
echo "   - Or use MongoDB Atlas cloud"
echo ""
echo "2. Start the backend server:"
echo "   cd ../Backend"
echo "   npm run dev"
echo ""
echo "3. Test the API:"
echo "   curl http://localhost:3000/api/health"
echo ""
echo "4. See BACKEND_SETUP.md for adding Farm and Recommendation routes"
echo ""
