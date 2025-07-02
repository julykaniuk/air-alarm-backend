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

function normalizeLocation(location) {
  return location.toLowerCase().replace(/[.,\-!]+/g, "").replace(/\s+/g, " ").trim();
}export async function alertMessage(rawText, sourceId) {
  const lines = rawText.split("\n").map(line => line.trim());
  const now = new Date();
  const alerts = [];

  for (const line of lines) {
    if (/^Зверніть увагу/i.test(line)) continue;

    const matchers = [
      { regex: /🔴\s*(.+?)\s*-\s*повітряна тривога!?/i, type: "повітряна", status: "alarm_started" },
      { regex: /🟡\s*(.+?)\s*-\s*відбій повітряної тривоги!?/i, type: "повітряна", status: "alarm_cleared" },
      { regex: /🔴\s*(.+?)\s*-\s*хімічна тривога!?/i, type: "хімічна", status: "alarm_started" },
      { regex: /🟡\s*(.+?)\s*-\s*відбій хімічної тривоги!?/i, type: "хімічна", status: "alarm_cleared" },
      { regex: /🔴\s*(.+?)\s*-\s*радіаційна тривога!?/i, type: "радіаційна", status: "alarm_started" },
      { regex: /🟡\s*(.+?)\s*-\s*відбій радіаційної тривоги!?/i, type: "радіаційна", status: "alarm_cleared" },
    ];

    for (const { regex, type, status } of matchers) {
      const match = line.match(regex);
      if (match) {
        const rawLocation = match[1].trim();
        const location = normalizeLocation(rawLocation);
        const alertObject = {
          id: uuidv4(),
          type: status,
          payload: {
            location,
            text: line,
            detectedAt: now.toISOString(),
            sourceId,
            alertType: type,
            sound: alertSounds[status === "alarm_started" ? type : `відбій-${type}`],
          },
        };

        alerts.push(alertObject);

        if (status === "alarm_started") {
          const existingAlert = await Alert.findActive(location, type);
          if (!existingAlert) {
            const newAlert = new Alert({
              type,
              location,
              startedAt: now,
              rawText: line,
              sourceId,
              status: "active",
            });
            await newAlert.save();
            console.log(`Збережено нову тривогу: ${type}, ${location}`);
          } else {
            console.log(`Тривога вже активна: ${type}, ${location}`);
          }
        } else if (status === "alarm_cleared") {
          const existingAlert = await Alert.findActive(location, type);
          if (existingAlert) {
            existingAlert.clearedAt = now;
            existingAlert.rawText = line;
            existingAlert.status = "cleared";
            await existingAlert.save();
            console.log(`Відбій тривоги: ${type}, ${location}`);
          } else {
            console.log(`Немає активної тривоги: ${type}, ${location}`);
          }
        }

        break;
      }
    }
  }

  return alerts.length ? alerts : null;
}
