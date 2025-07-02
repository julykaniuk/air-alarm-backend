import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { initWebSocketServer } from './ws/websocket.js';

import { broadcast } from './ws/websocket.js';
dotenv.config();

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

initWebSocketServer(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startTelegramService(broadcast);
});
