import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramMessage(text) {
    try {
        const res = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text,
            parse_mode: 'Markdown',
        });
        console.log('Telegram message sent:', res.data);
    } catch (error) {
        console.error('Telegram send error:', error.response?.data || error.message);
    }
}
export async function sendTelegramImage(imagePath, caption = "") {
    try {
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('caption', caption);
        form.append('photo', fs.createReadStream(imagePath));
        form.append('parse_mode', 'Markdown');
        const res = await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
            form,
            { headers: form.getHeaders() }
        );

        console.log('Telegram image sent:', res.data);
    } catch (error) {
        console.error('Telegram image send error:', error.response?.data || error.message);
    }
}