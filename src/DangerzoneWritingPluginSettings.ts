export default class DangerzoneWritingPluginSettings {
    public countdownSeconds: string;
    public secondsUntilDeletion: string;
    public succesfullSessionCount: string;

    constructor() {
        this.countdownSeconds = "60";
        this.secondsUntilDeletion = "5";
        this.succesfullSessionCount = "0";
    }

    getCountdownSecondsInteger() {
        return parseInt(this.countdownSeconds);
    }

    getSecondsUntilDeletionInteger() {
        return parseInt(this.secondsUntilDeletion);
    }

    getSuccesfullSessionCountInteger() {
        return parseInt(this.succesfullSessionCount);
    }
}