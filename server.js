const { WebSocketServer, WebSocket } = require('ws');
const express = require('express');
const path = require('path');

const app = express();
const chatHistory = [];

function logError(e) {
  console.log(e);
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());

// Route to handle incoming messages
app.post('/message', async (req, res) => {
  try {
    const message = req.body.message;
    console.log('Saved:', message);

    // Process the message here (e.g., save it to a database)
    chatHistory.push(message);

    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).send('Error processing message');
  }
});

app.get('/message/history', (req, res) => {
  res.json(chatHistory); // Send the messages array as JSON response
});

// Start the server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  socket.on('error', logError);

  // auth
  if (!!req.headers['Bad Auth']) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    socket.removeListener('error', logError);
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', (ws, req) => {
  ws.on('error', logError);

  ws.on('message', (message, isBinary) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message, { binary: isBinary });
      }
    });
  });

  ws.on('close', () => {
    console.log('Connection is now closed');
  });
});
