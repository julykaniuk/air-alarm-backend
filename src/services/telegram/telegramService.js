import { TelegramClient } from "telegram/index.js";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import {parseMessage } from "../parser/AlertParser.js";
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
  
        const parsed  = parseMessage(rawText, sourceId);
  
        if (parsed && Array.isArray(parsed)) {
          parsed.forEach(alert => {
            const messageToBroadcast = {
              type: alert.type,
              payload: alert.payload,
            };
        
            console.log("Broadcast повідомлення:", JSON.stringify(messageToBroadcast, null, 2));
        
            broadcast(messageToBroadcast);
          });
        } else {
          console.log("Повідомлення не розпізнано");
        }
        
      },
      new NewMessage({ chats: ["@test_backend_test"] })
    );
  }