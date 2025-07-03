import { AlertEventModel} from '../models/Alert.js';

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