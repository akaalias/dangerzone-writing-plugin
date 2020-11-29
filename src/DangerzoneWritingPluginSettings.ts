export default class DangerzoneWritingPluginSettings {
    public countdownSeconds: string;
    public secondsUntilDeletion: string;

    constructor() {
        this.countdownSeconds = "60";
        this.secondsUntilDeletion = "5";
    }

    getCountdownSecondsInteger() {
        return parseInt(this.countdownSeconds);
    }

    getSecondsUntilDeletion() {
        return parseInt(this.secondsUntilDeletion);
    }
}