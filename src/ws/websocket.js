import { WebSocketServer } from 'ws';
import {sendTelegramImage, sendTelegramMessage} from '../services/telegram/telegramBot.js';
import WebSocket from 'ws';
import { parseAlertMessageTeleg } from "../services/parser/alertParserTelegram.js";
import { parseTargetTeleg } from "../services/parser/parseTargetTeleg.js";
import { getActiveAlertLocations } from "../controllers/alertController.js";
import {takeMapScreenshot} from "../services/telegram/screenshot.js";

let wss;

export const initWebSocketServer = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', async (message) => {
      console.log('Отримано повідомлення від клієнта:', message.toString());

      let parsed;
      try {
        parsed = JSON.parse(message.toString());
      } catch (e) {
        console.error('Неправильний формат повідомлення (не JSON)');
        return;
      }

      await broadcast(parsed);
    });

    ws.on('close', () => console.log('Client disconnected'));
  });
};


export const broadcast = async (data = {}) => {
  if (!wss) {
    console.log("WebSocket server не ініціалізований");
    return;
  }

  let messageToSend = '';

  if (data && data.type && data.payload) {
    if (isTarget(data)) {
      messageToSend = parseTargetTeleg(data.payload);
    } else if (isAlert(data)) {
      messageToSend = parseAlertMessageTeleg(data, await getActiveAlertLocations());

      try {
        const screenshotPath = await takeMapScreenshot(`map_${Date.now()}.png`);
        await sendTelegramImage(screenshotPath, messageToSend);
        console.log("Скріншот відправлено з підписом.");
      } catch (err) {
        console.error("Помилка при створенні/відправленні скріншоту:", err);
      }
    } else {
      messageToSend = JSON.stringify(data);
    }
  } else if (typeof data === 'object' && data.text) {
    messageToSend = data.text;
  } else {
    messageToSend = JSON.stringify(data);
  }

  try {
    await sendTelegramMessage(messageToSend);
    console.log('Повідомлення відправлено в Telegram');
  } catch (err) {
    console.error('Помилка відправки в Telegram:', err);
  }

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageToSend);
    }
  });
};

function isTarget(data) {
  return data.type && data.type.toLowerCase().includes('загроза');
}
function isAlert(data) {
  return ['alarm_started', 'alarm_cleared'].includes(data.type);
}