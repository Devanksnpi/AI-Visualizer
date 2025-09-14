const express = require('express');
const { setupSSEConnection } = require('../services/sseService');

const router = express.Router();

// GET /api/stream - SSE endpoint for real-time updates
router.get('/', (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'http://localhost:3000',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'Access-Control-Allow-Credentials': 'true'
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

  // Setup SSE connection
  const clientId = setupSSEConnection(res);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`SSE client ${clientId} disconnected`);
    // Cleanup is handled in sseService
  });

  req.on('error', (error) => {
    console.error(`SSE client ${clientId} error:`, error);
  });
});

module.exports = router;
