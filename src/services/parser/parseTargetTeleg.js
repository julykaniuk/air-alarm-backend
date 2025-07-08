function cleanInvisibleChars(str) {
    if (!str) return '';
    return str.replace(/[\u200B-\u200D\uFE0E\uFE0F]/g, '').trim();
}

function extractWarningText(rawText) {
    if (!rawText) return '';
    const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);
    return lines[lines.length - 1];
}

export function parseTargetTeleg(targetObj) {
    if (!targetObj) return '';

    const city = cleanInvisibleChars(targetObj.city);
    const region = cleanInvisibleChars(targetObj.region);
    const type = cleanInvisibleChars(targetObj.type);

    let emoji = '❗️';
    const typeLower = type.toLowerCase();

    if (typeLower.includes('артилерії') || typeLower.includes('обстрілу')) emoji = '💥';
    else if (typeLower.includes('ракет')) emoji = '🚀';
    else if (typeLower.includes('дрон') || typeLower.includes('бпла')) emoji = '🛸';
    else if (typeLower.includes('авіація') || typeLower.includes('каб') || typeLower.includes('бомба')) emoji = '✈️';
    else emoji = '⚠️';

    const locationParts = [region, city].filter(Boolean);
    const location = locationParts.join(', ');

    let message = '';
    message += `${emoji} Увага!!!\n\n`;
    message += `📍 ${location || 'невідома локація'}\n`;
    message += `🎯 Тип загрози: ${type || 'невідомо'}\n\n`
    message += `➡️ ${extractWarningText(targetObj.rawText) ? extractWarningText(targetObj.rawText) + ' Негайно прямуйте в укриття!' : 'Негайно прямуйте в укриття!'}`;



    return message.trim();
}
