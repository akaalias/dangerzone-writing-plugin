import {addIcon, Notice, Plugin, WorkspaceLeaf, MarkdownView} from 'obsidian';
import DangerzoneWritingPluginSettings from "./DangerzoneWritingPluginSettings";
import DangerzoneWritingPluginSettingsTab from "./DangerzoneWritingPluginSettingsTab";
import CountdownTimer from "./CountdownTimer";

const svgPath = '<path d="M49.5122 90C29.3926 89.7355 13.1468 73.5337 12.8816 53.4685C13.1468 33.4032 29.3926 17.2014 49.5122 16.9369C69.6319 17.2014 85.8776 33.4032 86.1428 53.4685C85.8776 73.5337 69.6319 89.7355 49.5122 90ZM49.5122 25.0551C33.8635 25.2605 21.2278 37.8621 21.0217 53.4685C21.2278 69.0749 33.8635 81.6764 49.5122 81.8819C65.1609 81.6764 77.7967 69.0749 78.0027 53.4685C77.7967 37.8621 65.1609 25.2605 49.5122 25.0551ZM53.5823 73.7638H45.4421V57.5275H29.1619V49.4094H45.4421V33.1732H53.5823V49.4094H69.8625V57.5275H53.5823V73.7638ZM83.2612 27.9289L71.0144 15.7517L76.7491 10L89 22.1772L83.2612 27.9248V27.9289ZM15.7673 27.9289L10 22.1772L22.1736 10L27.9327 15.7476L15.7673 27.9248V27.9289Z" fill="#646464"/>';
addIcon('watch', svgPath);

export default class DangerzoneWritingPlugin extends Plugin {
    public settings: DangerzoneWritingPluginSettings;
    statusBar: HTMLElement;
    countdown: CountdownTimer;

    onload() {
        this.loadSettings();
        this.addSettingTab(new DangerzoneWritingPluginSettingsTab(this.app, this));

        this.statusBar = this.addStatusBarItem()

        this.addRibbonIcon('watch', 'Dangerzone Writing', () => {
            this.startOrContinueTimer();
        });

        this.registerEvent(
            this.app.on("codemirror", (cm: CodeMirror.Editor) => {
                cm.on("keydown", this.handleKeyDown);
            })
        );

        this.addCommand({
            id: "dangerzone-session-start",
            name: "Shortcut for starting a Dangerzone Writing session",
            callback: () => this.startOrContinueTimer(),
            hotkeys: [
                {
                    modifiers: ["Alt", "Shift"],
                    key: "⁄",
                },
            ],
        });
    }

    startOrContinueTimer() {
        this.setCustomStyle();

        if(this.countdown && !this.countdown.isFinished()) {
            this.countdown.resetCountdown();
        } else {
            this.startTimer();
        }
    }

    onunload() {
        this.removeStyle();
        clearInterval(this.countdown.intervalId);
    }

    loadSettings() {
        this.settings = new DangerzoneWritingPluginSettings();
        (async () => {
            const loadedSettings = await this.loadData();
            if (loadedSettings) {
                console.log("Found existing settings file for Dangerzone Writing");
                this.settings.countdownSeconds = loadedSettings.countdownSeconds;
                this.settings.secondsUntilDeletion = loadedSettings.secondsUntilDeletion;
                this.settings.succesfullSessionCount = loadedSettings.succesfullSessionCount;
                this.settings.customEditorFontSize = loadedSettings.customEditorFontSize;
                this.settings.customEditorBackgroundColor = loadedSettings.customEditorBackgroundColor;
            } else {
                console.log("No settings file found, creating for Dangerzone Writing");
                this.saveData(this.settings);
            }
        })();
    }

    startTimer() {
        let activeLeaf = this.app.workspace.activeLeaf;
        const mdView = this.app.workspace.activeLeaf.view as MarkdownView;

        if (mdView && mdView.sourceMode) {
            const cmEditor = mdView.sourceMode.cmEditor;

            if (cmEditor) {
                this.countdown = new CountdownTimer(this.settings.getCountdownSecondsInteger(),
                    cmEditor,
                    this.statusBar,
                    activeLeaf,
                    this.settings.getSecondsUntilDeletionInteger(),
                    this);

                new Notice("Dangerzone Writing session started!");
            } else {
                new Notice("No editor active");
            }
        } else {
            new Notice("No file open.");
        }
    }

    handleKeyDown = (
        cm: CodeMirror.Editor,
        event: KeyboardEvent
    ): void => {
        if (this.countdown) {
            this.countdown.resetSecondUntilDeletion();
        }
    };

    setCustomStyle() {
        const css = document.createElement('style');
        css.id = 'dangerzone-writing-style';

        const customEditorFontSizeCssString = this.settings.getCustomEditorFontSizeCssString();
        const customEditorBackgroundColor = this.settings.getCustomEditorBackgroundColorCssString();

        css.innerText = `
            #active-dangerzone-editor { 
                ${customEditorFontSizeCssString};
                ${customEditorBackgroundColor};             
            }`;

        document.getElementsByTagName("head")[0].appendChild(css);
        this.updateStyle();
    }

    updateStyle() {
        this.app.workspace.trigger('css-change');
    }

    removeStyle() {
        document.getElementById('dangerzone-writing-style').remove();
        this.app.workspace.trigger('css-change');
    }
}