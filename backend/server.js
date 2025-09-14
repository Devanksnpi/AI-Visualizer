const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const questionRoutes = require('./routes/questions');
const answerRoutes = require('./routes/answers');
const streamRoutes = require('./routes/stream');
const sessionRoutes = require('./routes/sessions');
const llmService = require('./services/llmService');
const databaseService = require('./data/database');
const manimService = require('./services/manimService');
const plotService = require('./services/plotService');
const svgService = require('./services/svgService');
const physicsService = require('./services/physicsService'); // New import

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static('public'));

// Serve static files for visualizations
app.use('/manim', express.static('public/manim')); // Manim videos
app.use('/plots', express.static('public/plots')); // Matplotlib/Plotly plots
app.use('/svg', express.static('public/svg')); // SVG diagrams
app.use('/physics', express.static('public/physics')); // Physics simulations

// Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/stream', streamRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize services
async function initializeServices() {
  try {
    // Initialize database
    await databaseService.initialize();
    
    // Initialize LLM service
    await llmService.initialize();
    
    // Initialize visualization services
    await manimService.initialize();
    await plotService.initialize();
    await svgService.initialize();
    await physicsService.initialize(); // New initialization
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    process.exit(1);
  }
}

// Initialize services and start server
initializeServices().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🗄️  Database: SQLite initialized`);
  });
});

module.exports = app;
