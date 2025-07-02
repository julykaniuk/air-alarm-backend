import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getAllAlerts } from './controllers/alertController.js';
import { getAllTargets } from './controllers/targetController.js';

dotenv.config();
const app = express();

app.use(express.json());
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });


app.get('/terget', getAllTargets);

export default app;
