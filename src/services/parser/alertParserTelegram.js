const alertsStartTimes = {};

export function parseAlertMessageTeleg(alertObj, activeLocations = []) {
    if (!alertObj) return '';

    let status = null;
    if (alertObj.type === 'alarm_started') status = 'start';
    else if (alertObj.type === 'alarm_cleared') status = 'end';

    const location = alertObj.payload?.location || 'невідоме місце';
    const alertType = alertObj.payload?.alertType || 'невідомий тип тривоги';

    const key = `${location}_${alertType}`;

    let emoji = '';
    let alarmText = '';

    switch (alertType.toLowerCase()) {
        case 'повітряна':
            emoji = status === 'start' ? '🚨🔊' : '🔇';
            alarmText = 'повітряна тривога';
            break;
        case 'хімічна':
            emoji = status === 'start' ? '🚨☣️' : '🔇';
            alarmText = 'хімічна тривога';
            break;
        case 'радіаційна':
            emoji = status === 'start' ? '🚨☢️' : '🔇';
            alarmText = 'радіаційна тривога';
            break;
        default:
            emoji = '⚠️';
            alarmText = alertType;
    }

    let message = '';

    if (status === 'start') {
        alertsStartTimes[key] = new Date(alertObj.payload?.detectedAt || Date.now()).toISOString();
        message += `${emoji} Увага!\n`;
        message += `*${location}* оголошена ${alarmText}!\n`;
    } else if (status === 'end') {
        const startTimeISO = alertsStartTimes[key];
        let durationText = '';
        if (startTimeISO) {
            const startTime = new Date(startTimeISO);
            const endTime = new Date(alertObj.payload?.detectedAt || Date.now());
            const diffMs = endTime - startTime;
            const diffMinutes = Math.floor(diffMs / 60000);
            durationText = `\n⏱ Тривалість тривоги: ${diffMinutes} хвилин.`;
            delete alertsStartTimes[key];
        }
        message += `${emoji} Увага!\n`;
        message += `*${location}* — відбій ${alarmText}!${durationText}\n`;
    } else {
        message += `Увага!\nСтатус тривоги: ${alertObj.type || 'невідомий'}\n`;
    }

    if (status === 'end' && Array.isArray(activeLocations) && activeLocations.length > 0) {
        message += '\nЗверніть увагу, тривога досі триває у:\n';
        activeLocations.forEach(loc => {
            message += `- ${loc}\n`;
        });
    }

    return message.trim();
}
