const { v4: uuidv4 } = require('uuid');

// Store active SSE connections
const clients = new Map();

// Setup a new SSE connection
const setupSSEConnection = (res) => {
  const clientId = uuidv4();
  
  clients.set(clientId, {
    id: clientId,
    response: res,
    connectedAt: new Date()
  });

  console.log(`SSE client ${clientId} connected. Total clients: ${clients.size}`);

  // Send periodic heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    if (clients.has(clientId)) {
      try {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
      } catch (error) {
        console.error(`Heartbeat failed for client ${clientId}:`, error);
        cleanupClient(clientId);
        clearInterval(heartbeat);
      }
    } else {
      clearInterval(heartbeat);
    }
  }, 30000); // Send heartbeat every 30 seconds

  // Store heartbeat interval for cleanup
  const client = clients.get(clientId);
  if (client) {
    client.heartbeat = heartbeat;
  }

  return clientId;
};

// Broadcast data to all connected clients
const broadcastToClients = (data) => {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const disconnectedClients = [];

  console.log(`Broadcasting to ${clients.size} clients:`, data.type);

  for (const [clientId, client] of clients.entries()) {
    try {
      client.response.write(message);
    } catch (error) {
      console.error(`Failed to send message to client ${clientId}:`, error);
      disconnectedClients.push(clientId);
    }
  }

  // Clean up disconnected clients
  disconnectedClients.forEach(cleanupClient);
};

// Clean up a specific client
const cleanupClient = (clientId) => {
  const client = clients.get(clientId);
  if (client) {
    // Clear heartbeat interval
    if (client.heartbeat) {
      clearInterval(client.heartbeat);
    }
    
    // Close response if still open
    try {
      if (!client.response.destroyed) {
        client.response.end();
      }
    } catch (error) {
      console.error(`Error closing response for client ${clientId}:`, error);
    }
    
    clients.delete(clientId);
    console.log(`Cleaned up client ${clientId}. Remaining clients: ${clients.size}`);
  }
};

// Get connection statistics
const getConnectionStats = () => {
  return {
    totalClients: clients.size,
    clients: Array.from(clients.values()).map(client => ({
      id: client.id,
      connectedAt: client.connectedAt
    }))
  };
};

// Cleanup all connections (for graceful shutdown)
const cleanupAllClients = () => {
  console.log(`Cleaning up ${clients.size} SSE connections...`);
  for (const clientId of clients.keys()) {
    cleanupClient(clientId);
  }
};

module.exports = {
  setupSSEConnection,
  broadcastToClients,
  cleanupClient,
  getConnectionStats,
  cleanupAllClients
};
