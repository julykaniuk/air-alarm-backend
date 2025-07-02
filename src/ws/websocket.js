import { WebSocketServer } from 'ws';

let wss;

export const initWebSocketServer = (server) => {
  wss = new WebSocketServer({ server });
  wss.on('connection', ws => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
  });

};

export const broadcast = (data) => {
  if (!wss) {
    console.log("WebSocket server не ініціалізований");
    return;
  }
  const message = JSON.stringify(data);

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
      console.log("Повідомлення надіслано");
    }
  });
};
