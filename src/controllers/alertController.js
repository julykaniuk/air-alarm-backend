import { AlertEventModel} from '../models/Alert.js';
import { TargetModel } from "../models/Target.js";

export async function getAllAlerts(req, res) {
    try {
        const alerts = await AlertEventModel.find().sort({ startedAt: -1 });
        res.json(alerts);
    } catch (error) {
        console.error('Помилка отримання тривог:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

export async function getAllActiveAlerts(req, res) {
    try {
        const activeAlerts = await AlertEventModel.find({ status: "active" }).sort({ startedAt: -1 });
        res.json(activeAlerts);
    } catch (error) {
        console.error('Помилка отримання активних тривог:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

export async function getActiveAlertLocations() {
    const activeAlerts = await AlertEventModel.find({ status: 'active' });

    return activeAlerts.map(alert => alert.location);
}

export const getActiveTargetsByRegion = async (req, res) => {
    try {
        const { region, city } = req.query;

        if (!region) {
            return res.status(400).json({ message: "Необхідно вказати region" });
        }

        console.log("Region from query:", region);
        const activeAlert = await AlertEventModel.findOne({
            location: { $regex: new RegExp(region, "i") },
            status: "active",
        }).sort({ startedAt: -1 });
        console.log("Found active alert:", activeAlert);

        if (!activeAlert) {
            return res.json([]);
        }

        const targetQuery = {
            region: { $regex: new RegExp(region, "i") },
            detectedAt: { $gte: activeAlert.startedAt },
        };

        if (city) {
            targetQuery.city = { $regex: new RegExp(city, "i") };
        }

        const targets = await TargetModel.find(targetQuery).sort({ detectedAt: -1 });

        return res.json(targets);
    } catch (error) {
        console.error("Помилка при отриманні активних цілей:", error);
        return res.status(500).json({ message: "Внутрішня помилка сервера" });
    }
};
