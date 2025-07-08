import { v4 as uuidv4 } from "uuid";
import { Alert } from "../../models/Alert.js";

const alertSounds = {
  "повітряна": "air_alert_sound",
  "хімічна": "chemical_alert_sound",
  "радіаційна": "radiation_alert_sound",
  "відбій-повітряної": "air_alert_sound",
  "відбій-хімічної": "chemical_alert_sound",
  "відбій-радіаційної": "radiation_alert_sound",
};

function removeLeadingEmoji(text) {
  return text.replace(/^[^\p{L}\d\s:]+/u, "").trim();
}
export async function alertMessage(rawText, sourceId) {
  const lines = rawText.split("\n").map(line => removeLeadingEmoji(line.trim()));
  const now = new Date();
  const alerts = [];

  const matchers = [
    { regex: /^(?:Нове повідомлення:)?\s*(.+?)\s*-\s*повітряна тривога!?$/i, type: "повітряна", status: "alarm_started" },
    { regex: /^(?:Нове повідомлення:)?\s*(.+?)\s*-\s*відбій повітряної тривоги!?$/i, type: "повітряна", status: "alarm_cleared" },
    { regex: /^(?:Нове повідомлення:)?\s*(.+?)\s*-\s*хімічна тривога!?$/i, type: "хімічна", status: "alarm_started" },
    { regex: /^(?:Нове повідомлення:)?\s*(.+?)\s*-\s*відбій хімічної тривоги!?$/i, type: "хімічна", status: "alarm_cleared" },
    { regex: /^(?:Нове повідомлення:)?\s*(.+?)\s*-\s*радіаційна тривога!?$/i, type: "радіаційна", status: "alarm_started" },
    { regex: /^(?:Нове повідомлення:)?\s*(.+?)\s*-\s*відбій радіаційної тривоги!?$/i, type: "радіаційна", status: "alarm_cleared" },
  ];

  for (const line of lines) {
    if (/^Зверніть увагу/i.test(line)) continue;

    for (const { regex, type, status } of matchers) {
      const match = line.match(regex);
      if (match && match[1]) {
        const rawLocation = match[1].trim();

        const alertObject = {
          id: uuidv4(),
          type: status,
          payload: {
            location: rawLocation,
            text: line,
            detectedAt: now.toISOString(),
            sourceId,
            alertType: type,
            sound: alertSounds[status === "alarm_started" ? type : `відбій-${type}`],
          },
        };

        alerts.push(alertObject);

        if (status === "alarm_started") {
          const existingAlert = await Alert.findActive(rawLocation, type);
          if (!existingAlert) {
            const newAlert = new Alert({
              type,
              location: rawLocation,
              startedAt: now,
              rawText: line,
              sourceId,
              status: "active",
            });
            await newAlert.save();
            console.log(`Збережено нову тривогу: ${type}, ${rawLocation}`);
          } else {
            console.log(`Тривога вже активна: ${type}, ${rawLocation}`);
          }
        } else if (status === "alarm_cleared") {
          const existingAlert = await Alert.findActive(rawLocation, type);
          if (existingAlert) {
            existingAlert.clearedAt = now;
            existingAlert.rawText = line;
            existingAlert.status = "cleared";
            await existingAlert.save();
            console.log(`Відбій тривоги: ${type}, ${rawLocation}`);
          } else {
            console.log(`Немає активної тривоги: ${type}, ${rawLocation}`);
          }
        }

        break;
      }
    }
  }

  return alerts.length ? alerts : null;
}
