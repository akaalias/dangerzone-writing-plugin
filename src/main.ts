import {addIcon, Notice, Plugin, WorkspaceLeaf} from 'obsidian';
import DangerzoneWritingPluginSettings from "./DangerzoneWritingPluginSettings"
import DangerzoneWritingPluginSettingsTab from "./DangerzoneWritingPluginSettingsTab"

const svgPath = '<path d="M49.5122 90C29.3926 89.7355 13.1468 73.5337 12.8816 53.4685C13.1468 33.4032 29.3926 17.2014 49.5122 16.9369C69.6319 17.2014 85.8776 33.4032 86.1428 53.4685C85.8776 73.5337 69.6319 89.7355 49.5122 90ZM49.5122 25.0551C33.8635 25.2605 21.2278 37.8621 21.0217 53.4685C21.2278 69.0749 33.8635 81.6764 49.5122 81.8819C65.1609 81.6764 77.7967 69.0749 78.0027 53.4685C77.7967 37.8621 65.1609 25.2605 49.5122 25.0551ZM53.5823 73.7638H45.4421V57.5275H29.1619V49.4094H45.4421V33.1732H53.5823V49.4094H69.8625V57.5275H53.5823V73.7638ZM83.2612 27.9289L71.0144 15.7517L76.7491 10L89 22.1772L83.2612 27.9248V27.9289ZM15.7673 27.9289L10 22.1772L22.1736 10L27.9327 15.7476L15.7673 27.9248V27.9289Z" fill="#646464"/>';
addIcon('watch', svgPath);

export default class DangerzoneWritingPlugin extends Plugin {
    public settings: DangerzoneWritingPluginSettings;
    statusBar: HTMLElement;
    countdown: CountdownTimer;
    cmEditor: CodeMirror.Editor;

    onload() {
        this.loadSettings();
        this.addSettingTab(new DangerzoneWritingPluginSettingsTab(this.app, this));

        this.statusBar = this.addStatusBarItem()

        this.addRibbonIcon('watch', 'Dangerzone Writing', () => {
            this.startTimer();
        });

        this.registerEvent(
            this.app.on("codemirror", (cm: CodeMirror.Editor) => {
                this.cmEditor = cm;
                cm.on("keydown", this.handleKeyDown);
            })
        );
    }

    onunload() {
        console.log('unloading plugin');
        this.cmEditor.off("keydown", this.handleKeyDown);
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
            } else {
                console.log("No settings file found, creating for Dangerzone Writing");
                this.saveData(this.settings);
            }
        })();
    }

    startTimer() {
        let activeLeaf = this.app.workspace.activeLeaf;

        if (this.cmEditor) {
            //console.log(this.cmEditor);

            this.countdown = new CountdownTimer(this.settings.getCountdownSecondsInteger(),
                this.cmEditor,
                this.statusBar,
                activeLeaf,
                this.settings.getSecondsUntilDeletionInteger(),
                this);

            new Notice("Dangerzone Writing session started!");

        } else {
            new Notice("No editor open.");
        }
    }

    handleKeyDown = (
        cm: CodeMirror.Editor,
        event: KeyboardEvent
    ): void => {
        if (this.countdown) {
            this.countdown.resetSecondUntilDeletion()
        }
    };
}

class CountdownTimer {
    public intervalId: NodeJS.Timeout;
    editor: CodeMirror.Editor;
    activeLeaf: WorkspaceLeaf;
    secondsUntilDeletion: number;
    secondsRemaining: number;
    plugin: DangerzoneWritingPlugin;

    constructor(public counter: number, editor: CodeMirror.Editor, statusBar: HTMLElement, activeLeaf: WorkspaceLeaf, secondsUntilDeletion: number, plugin: DangerzoneWritingPlugin) {
        this.plugin = plugin;
        this.editor = editor;
        this.secondsUntilDeletion = secondsUntilDeletion;
        this.secondsRemaining = secondsUntilDeletion;

        this.activeLeaf = activeLeaf;
        this.counter = counter;

        this.intervalId = setInterval(() => {

            this.counter = this.counter - 1;
            this.secondsRemaining = this.secondsRemaining - 1;

            if (this.secondsRemaining < this.secondsUntilDeletion && this.editor.getValue().length > 0) {
                statusBar.setText(`${this.secondsRemaining}`);
                statusBar.setAttr('style', 'color: red;');
            } else {
                statusBar.setText(`${this.counter} seconds left`);
                statusBar.setAttr('style', 'color: #999;');
            }

            if (this.secondsRemaining <= 0) {
                this.editor.setValue('');
                this.secondsRemaining = this.secondsUntilDeletion + 1;
            }

            if (this.counter === 0) {
                statusBar.setText("");
                clearInterval(this.intervalId);
                new Notice("Dangerzone session finished!");

                // Save progress if there's something written
                if(this.editor.getValue().length > 0) {
                    let currentSettings = this.plugin.settings;
                    currentSettings.succesfullSessionCount = (currentSettings.getSuccesfullSessionCountInteger() + 1).toString();
                    this.plugin.saveData(currentSettings);
                }
            }
        }, 1000)
    }

    resetSecondUntilDeletion() {
        // important: add +1 to this.secondsUntilDeletion to account for at least one key-stroke
        this.secondsRemaining = this.secondsUntilDeletion + 1;
    }
}