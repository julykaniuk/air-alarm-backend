import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {getActiveTargetsByRegion, getAllActiveAlerts, getAllAlerts} from './controllers/alertController.js';
import { getAllTargets } from './controllers/targetController.js';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });


app.get('/alerts', getAllAlerts);
app.get('/activeAlerts', getAllActiveAlerts);
app.get('/target', getAllTargets);
app.get("/threatsActive", getActiveTargetsByRegion);

export default app;
