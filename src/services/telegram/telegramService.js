import { TelegramClient } from "telegram/index.js";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import { alertMessage } from "../parser/AlertParser.js";
import { targetMessage } from "../parser/TargetParser.js";

import fs from "fs/promises";
import input from "input";

export async function startTelegramService(broadcast) {
  const apiId = Number(process.env.API_ID);
  const apiHash = process.env.API_HASH;
    const sessionFile = "./session.txt";
  
    let stringSession;
  
    try {
      const savedSession = await fs.readFile(sessionFile, "utf8");
      stringSession = new StringSession(savedSession.trim());
      console.log("Сесія знайдена, вхід без повторної авторизації.");
    } catch {
      stringSession = new StringSession("");
      console.log("Сесія не знайдена, буде виконано авторизацію.");
    }
  
    const client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });
  
    await client.start({
      phoneNumber: async () => await input.text("Введіть номер телефону: "),
      password: async () => await input.text("Введіть пароль (2FA, якщо увімкнено): "),
      phoneCode: async () => await input.text("Введіть код з Telegram: "),
      onError: (err) => console.log("Помилка авторизації:", err),
    });
  
    console.log("Авторизовано!");
  
    await fs.writeFile(sessionFile, client.session.save());
    console.log("Сесію збережено у файл session.txt");

  client.addEventHandler(
      async (event) => {
        const rawText = event.message.message;
        const sourceId = event.chat?.username || 'unknown';

        console.log("🔴 Нове повідомлення:", rawText);

        const alertParsed = alertMessage(rawText, sourceId);
        const targetParsed = targetMessage(rawText, sourceId);

        console.log("Результат парсингу цілей:", targetParsed);
        console.log("Результат парсингу тривог:", alertParsed);

        if (targetParsed && Array.isArray(targetParsed) && targetParsed.length > 0) {
          targetParsed.forEach(target => {
            const messageToBroadcast = {
              type: target.type,
              payload: {
                id: target.id,
                sourceId: target.sourceId,
                type: target.type,
                direction: target.direction,
                coordinates: target.coordinates,
                city: target.city,
                district: target.district,
                territory: target.territory,
                region: target.region,
                locationName: target.locationName,
                detectedAt: target.detectedAt,
                rawText: target.rawText,
                color: target.color,
                sound: target.sound,
                code: target.code,
              },
            };

            console.log("Broadcast повідомлення:", JSON.stringify(messageToBroadcast, null, 2));

            broadcast(messageToBroadcast);
          });
        } else {
          console.log("Цілі не знайдено або формат не той");
        }

        if (alertParsed && Array.isArray(alertParsed) && alertParsed.length > 0) {
          alertParsed.forEach(alert => {
            const messageToBroadcast = {
              type: alert.type,
              payload: alert.payload,
            };

            console.log("Broadcast повідомлення:", JSON.stringify(messageToBroadcast, null, 2));

            broadcast(messageToBroadcast);
          });
        } else {
          console.log("Тривоги не розпізнано");
        }
      },
  new NewMessage({ chats: ["@test_backend_test"] })
    );
  }