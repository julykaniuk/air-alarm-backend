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
