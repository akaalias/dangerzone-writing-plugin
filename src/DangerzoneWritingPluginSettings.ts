export default class DangerzoneWritingPluginSettings {
    public countdownSeconds: string;
    public secondsUntilDeletion: string;
    public succesfullSessionCount: string;
    public customEditorFontSize: string;
    public customEditorBackgroundColor: string;

    constructor() {
        this.countdownSeconds = "60";
        this.secondsUntilDeletion = "5";
        this.succesfullSessionCount = "0";
        this.customEditorFontSize = "";
        this.customEditorBackgroundColor = "";
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

    getCustomEditorFontSizeCssString() {
        if(this.customEditorFontSize != "") {
            return `font-size: ${this.customEditorFontSize}pt`;
        } else {
            return "";
        }
    }

    getCustomEditorBackgroundColorCssString() {
        if(this.customEditorBackgroundColor != "") {
            return `background-color: ${this.customEditorBackgroundColor}`;
        } else {
            return "";
        }
    }
}