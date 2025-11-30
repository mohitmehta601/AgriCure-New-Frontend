# AgriCure Backend Quick Setup Script (PowerShell)
# Run this from the Frontend directory

Write-Host "🌱 AgriCure Backend Setup Starting..." -ForegroundColor Green

# Create backend directory
$backendPath = "..\Backend"
New-Item -ItemType Directory -Force -Path $backendPath | Out-Null
Set-Location $backendPath

Write-Host "📦 Initializing Node.js project..." -ForegroundColor Cyan
npm init -y

Write-Host "📥 Installing dependencies..." -ForegroundColor Cyan
npm install express mongoose bcryptjs jsonwebtoken dotenv cors body-parser
npm install --save-dev nodemon

# Create directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src\config" | Out-Null
New-Item -ItemType Directory -Force -Path "src\models" | Out-Null
New-Item -ItemType Directory -Force -Path "src\routes" | Out-Null
New-Item -ItemType Directory -Force -Path "src\middleware" | Out-Null

Write-Host "📝 Creating configuration files..." -ForegroundColor Cyan

# Create .env file
@"
PORT=3000
MONGODB_URI=mongodb://localhost:27017/agricure
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding utf8

# Create database config
@"
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
"@ | Out-File -FilePath "src\config\database.js" -Encoding utf8

# Create User model
@"
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
"@ | Out-File -FilePath "src\models\User.js" -Encoding utf8

# Create auth middleware
@"
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
"@ | Out-File -FilePath "src\middleware\auth.js" -Encoding utf8

# Create auth routes
@"
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
"@ | Out-File -FilePath "src\routes\auth.js" -Encoding utf8

# Create server.js
@"
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
  console.log('🚀 Server running on port ' + PORT);
});
"@ | Out-File -FilePath "src\server.js" -Encoding utf8

# Update package.json with scripts
npm pkg set scripts.start="node src/server.js"
npm pkg set scripts.dev="nodemon src/server.js"

Write-Host ""
Write-Host "✅ Backend setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure MongoDB is running:" -ForegroundColor White
Write-Host "   - Install MongoDB: https://www.mongodb.com/try/download/community"
Write-Host "   - Start MongoDB service or run: mongod"
Write-Host ""
Write-Host "2. Start the backend server:" -ForegroundColor White
Write-Host "   cd ..\Backend"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "3. Test the API:" -ForegroundColor White
Write-Host "   Invoke-WebRequest -Uri http://localhost:3000/api/health"
Write-Host ""
Write-Host "4. See BACKEND_SETUP.md for adding Farm and Recommendation routes" -ForegroundColor White
Write-Host ""
