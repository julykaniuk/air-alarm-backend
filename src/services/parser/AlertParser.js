import { v4 as uuidv4 } from "uuid";
import { AlertStatus } from "../../models/AlertStatus.js";

const alertStatus = new AlertStatus();

function normalizeLocation(location) {
  return location.toLowerCase().replace(/[.,\-!]+/g, "").replace(/\s+/g, " ").trim();
}

const alertSounds = {
  "повітряна": "air_alert_sound",
  "хімічна": "chemical_alert_sound",
  "радіаційна": "radiation_alert_sound",
  "відбій-повітряної": "air_alert_sound",
  "відбій-хімічної": "chemical_alert_sound",
  "відбій-радіаційної": "radiation_alert_sound",
};

export function alertMessage(rawText, sourceId) {
  const lines = rawText.split("\n").map(line => line.trim());
  const now = new Date().toISOString();
  const alerts = [];

  for (const line of lines) {
    if (/^Зверніть увагу/i.test(line)) continue;

    const matchAirActive = line.match(/🔴\s*(.+?)\s*-\s*повітряна тривога!?/i);
    if (matchAirActive) {
      const rawLocation = matchAirActive[1].trim();
      const location = normalizeLocation(rawLocation);

      alertStatus.addAlert(location, "повітряна");

      alerts.push({
        id: uuidv4(),
        type: "alarm_started",
        payload: {
          location,
          text: line,
          detectedAt: now,
          sourceId,
          alertType: "повітряна",
          sound: alertSounds["повітряна"],
          currentStatus: alertStatus.toObject()
        }
      });

      console.log("Початок повітряної тривоги:", location);
      continue;
    }

    const matchAirCleared = line.match(/🟡\s*(.+?)\s*-\s*відбій повітряної тривоги!?/i);
    if (matchAirCleared) {
      const rawLocation = matchAirCleared[1].trim();
      const location = normalizeLocation(rawLocation);

      alertStatus.clearAlert(location, "повітряна");

      alerts.push({
        id: uuidv4(),
        type: "alarm_cleared",
        payload: {
          location,
          text: line,
          detectedAt: now,
          sourceId,
          alertType: "повітряна",
          sound: alertSounds["відбій-повітряної"],
          currentStatus: alertStatus.toObject()
        }
      });

      console.log("Відбій повітряної тривоги:", location);
      continue;
    }

    const matchChemicalActive = line.match(/🔴\s*(.+?)\s*-\s*хімічна тривога!?/i);
    if (matchChemicalActive) {
      const rawLocation = matchChemicalActive[1].trim();
      const location = normalizeLocation(rawLocation);

      alertStatus.addAlert(location, "хімічна");

      alerts.push({
        id: uuidv4(),
        type: "alarm_started",
        payload: {
          location,
          text: line,
          detectedAt: now,
          sourceId,
          alertType: "хімічна",
          sound: alertSounds["хімічна"],
          currentStatus: alertStatus.toObject()
        }
      });

      console.log("Початок хімічної тривоги:", location);
      continue;
    }

    const matchChemicalCleared = line.match(/🟡\s*(.+?)\s*-\s*відбій хімічної тривоги!?/i);
    if (matchChemicalCleared) {
      const rawLocation = matchChemicalCleared[1].trim();
      const location = normalizeLocation(rawLocation);

      alertStatus.clearAlert(location, "хімічна");

      alerts.push({
        id: uuidv4(),
        type: "alarm_cleared",
        payload: {
          location,
          text: line,
          detectedAt: now,
          sourceId,
          alertType: "хімічна",
          sound: alertSounds["відбій-хімічної"],
          currentStatus: alertStatus.toObject()
        }
      });

      console.log("Відбій хімічної тривоги:", location);
      continue;
    }

    const matchRadiationActive = line.match(/🔴\s*(.+?)\s*-\s*радіаційна тривога!?/i);
    if (matchRadiationActive) {
      const rawLocation = matchRadiationActive[1].trim();
      const location = normalizeLocation(rawLocation);

      alertStatus.addAlert(location, "радіаційна");

      alerts.push({
        id: uuidv4(),
        type: "alarm_started",
        payload: {
          location,
          text: line,
          detectedAt: now,
          sourceId,
          alertType: "радіаційна",
          sound: alertSounds["радіаційна"],
          currentStatus: alertStatus.toObject()
        }
      });

      console.log("Початок радіаційної тривоги:", location);
      continue;
    }

    const matchRadiationCleared = line.match(/🟡\s*(.+?)\s*-\s*відбій радіаційної тривоги!?/i);
    if (matchRadiationCleared) {
      const rawLocation = matchRadiationCleared[1].trim();
      const location = normalizeLocation(rawLocation);

      alertStatus.clearAlert(location, "радіаційна");

      alerts.push({
        id: uuidv4(),
        type: "alarm_cleared",
        payload: {
          location,
          text: line,
          detectedAt: now,
          sourceId,
          alertType: "радіаційна",
          sound: alertSounds["відбій-радіаційної"],
          currentStatus: alertStatus.toObject()
        }
      });

      console.log("Відбій радіаційної тривоги:", location);
      continue;
    }
  }

  return alerts.length ? alerts : null;
}
