import { v4 as uuidv4 } from "uuid";
import { AlertStatus } from "../../models/AlertStatus.js";

const alertStatus = new AlertStatus();

function normalizeLocation(location) {
  return location.toLowerCase().replace(/[.,\-!]+/g, "").replace(/\s+/g, " ").trim();
}

export function parseMessage(rawText, sourceId) {
  const lines = rawText.split("\n").map(line => line.trim());
  const now = new Date().toISOString();
  const alerts = [];

  for (const line of lines) {
    if (/^Зверніть увагу/i.test(line)) continue;

    const matchActive = line.match(/🔴\s*(.+?)\s*-\s*повітряна тривога!?/i);
    if (matchActive) {
      const rawLocation = matchActive[1].trim();
      const location = normalizeLocation(rawLocation);

      alertStatus.airAlert.add(location);
      alertStatus.airAlertOff.delete(location);

      alerts.push({
        id: uuidv4(),
        type: "alarm_started",
        payload: {
          location,
          text: line,
          detectedAt: now,
          sourceId,
          currentStatus: alertStatus.toObject()
        }
      });

      console.log("Початок тривоги:", location);
      continue;
    }

    const matchCleared = line.match(/🟡\s*(.+?)\s*-\s*відбій повітряної тривоги!?/i);
    if (matchCleared) {
      const rawLocation = matchCleared[1].trim();
      const location = normalizeLocation(rawLocation);

      alertStatus.airAlert.delete(location);
      alertStatus.airAlertOff.add(location);

      alerts.push({
        id: uuidv4(),
        type: "alarm_cleared",
        payload: {
          location,
          text: line,
          detectedAt: now,
          sourceId,
          currentStatus: alertStatus.toObject()
        }
      });

      console.log("Відбій тривоги:", location);
      continue;
    }
  }

  return alerts.length ? alerts : null;
}
