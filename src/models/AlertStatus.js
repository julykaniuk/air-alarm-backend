export class AlertStatus {
    constructor() {
        this.activeAlerts = {
            "повітряна": new Set(),
            "хімічна": new Set(),
            "радіаційна": new Set(),
        };
        this.clearedAlerts = {
            "повітряна": new Set(),
            "хімічна": new Set(),
            "радіаційна": new Set(),
        };
    }

    addAlert(location, type) {
        if (!this.activeAlerts[type]) this.activeAlerts[type] = new Set();
        this.activeAlerts[type].add(location);

        if (!this.clearedAlerts[type]) this.clearedAlerts[type] = new Set();
        this.clearedAlerts[type].delete(location);
    }

    clearAlert(location, type) {
        if (!this.clearedAlerts[type]) this.clearedAlerts[type] = new Set();
        this.clearedAlerts[type].add(location);

        if (!this.activeAlerts[type]) this.activeAlerts[type] = new Set();
        this.activeAlerts[type].delete(location);
    }

    toObject() {
        const serialize = obj => {
            const result = {};
            for (const key in obj) {
                result[key] = Array.from(obj[key]);
            }
            return result;
        };

        return {
            activeAlerts: serialize(this.activeAlerts),
            clearedAlerts: serialize(this.clearedAlerts),
        };
    }

    clear() {
        for (const type in this.activeAlerts) this.activeAlerts[type].clear();
        for (const type in this.clearedAlerts) this.clearedAlerts[type].clear();
    }
}
