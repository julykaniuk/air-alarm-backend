export class AlertStatus {
    constructor() {
      this.airAlert = new Set();
      this.airAlertOff = new Set();
    }
  
    toObject() {
      return {
        airAlert: Array.from(this.airAlert),
        airAlertOff: Array.from(this.airAlertOff),
      };
    }
  
    clear() {
      this.airAlert.clear();
      this.airAlertOff.clear();
    }
  }
  
  