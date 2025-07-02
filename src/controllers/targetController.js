import { TargetModel } from '../models/Target.js';

export async function getAllTargets(req, res) {
    try {
        const targets = await TargetModel.find().sort({ detectedAt: -1 });
        res.json(targets);
    } catch (error) {
        console.error('Помилка отримання цілей:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
