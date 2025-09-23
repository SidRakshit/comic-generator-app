// Minimal test server to verify Railway can start a Node.js process
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;

app.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Test server is running', port: PORT });
});

console.log('Starting test server...');
console.log(`Port: ${PORT}`);
console.log(`Type: ${typeof PORT}`);

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`✅ Test server started on port ${PORT}`);
  console.log(`✅ Server address: ${server.address()}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

console.log('Test server setup complete');
