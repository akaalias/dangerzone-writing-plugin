import {Editor, MarkdownView, Notice, WorkspaceLeaf} from "obsidian";
import DangerzoneWritingPlugin from "./main";

export default class CountdownTimer {
    public intervalId: NodeJS.Timeout;
    editor: Editor;
    activeLeaf: WorkspaceLeaf;
    secondsUntilDeletion: number;
    secondsRemaining: number;
    plugin: DangerzoneWritingPlugin;
    originalCountdownSeconds: number;

    constructor(public counter: number, statusBar: HTMLElement, activeLeaf: WorkspaceLeaf, secondsUntilDeletion: number, plugin: DangerzoneWritingPlugin) {
        this.plugin = plugin;
        this.editor = (activeLeaf.view as MarkdownView).editor;
        this.secondsUntilDeletion = secondsUntilDeletion;
        this.secondsRemaining = secondsUntilDeletion;
        this.activeLeaf = activeLeaf;
        this.counter = counter;
        this.originalCountdownSeconds = counter;

        const wrapper = activeLeaf.view.containerEl;
        const keyDownCb =  this.handleKeyDown.bind(this);
        wrapper.addEventListener("keydown", keyDownCb);

        wrapper.setAttribute("id", "active-dangerzone-editor");

        this.intervalId = setInterval(() => {

            this.counter = this.counter - 1;
            this.secondsRemaining = this.secondsRemaining - 1;

            if (this.secondsRemaining < this.secondsUntilDeletion && this.editor.getValue().length > 0) {

                if(this.secondsRemaining <= 5) {
                    const opacity = this.getOpacityForSecondsRemaining(this.secondsRemaining, this.secondsUntilDeletion);
                    wrapper.setAttribute("style", "opacity:" + opacity + "%");
                }

                statusBar.setText(`${this.secondsRemaining}`);
                statusBar.setAttr('style', 'color: red;');
            } else {
                wrapper.setAttribute("style", "opacity: 100%");

                statusBar.setText(`${this.counter} seconds left`);
                statusBar.setAttr('style', 'color: #999;');
            }

            if (this.secondsRemaining <= 0) {
                this.editor.setValue('');
                this.secondsRemaining = this.secondsUntilDeletion + 1;
            }

            if (this.counter === 0) {
                statusBar.setText("");
                new Notice("Dangerzone session finished!");

                wrapper.setAttribute("style", "opacity: 100%");
                this.plugin.removeStyle();

                // Save progress if there's something written
                if(this.editor.getValue().length > 0) {
                    let currentSettings = this.plugin.settings;
                    currentSettings.succesfullSessionCount = (currentSettings.getSuccesfullSessionCountInteger() + 1).toString();
                    this.plugin.saveData(currentSettings);
                }

                clearInterval(this.intervalId);
                wrapper.removeEventListener("keydown", keyDownCb);
            }
        }, 1000)
    }

    handleKeyDown = () => {
        if (!this.isFinished()) {
            this.resetSecondUntilDeletion();
        }
    };


    getOpacityForSecondsRemaining(secondsRemaining: number, secondsUntilDeletion: number) {
        // 3 / 5
        return secondsRemaining / secondsUntilDeletion * 100;
    }

    resetCountdown() {
        this.counter = this.originalCountdownSeconds;
    }

    resetSecondUntilDeletion() {
        // important: add +1 to this.secondsUntilDeletion to account for at least one key-stroke
        this.secondsRemaining = this.secondsUntilDeletion + 1;
    }

    isFinished() {
        return this.counter <= 0;
    }
}