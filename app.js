const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Harness CI Lab!' });
});

// API endpoint
app.get('/api/info', (req, res) => {
  res.json({
    app: 'harness-ci-lab',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Math utility functions
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

// Export for testing
module.exports = { app, add, multiply };

// Start server only if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
