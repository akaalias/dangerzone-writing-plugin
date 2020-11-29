import {App, PluginSettingTab, Setting} from "obsidian";
import DangerzoneWritingPlugin from "./main";

export default class ExtractHighlightsPluginSettingsTab extends PluginSettingTab {
    private readonly plugin: DangerzoneWritingPlugin;

    constructor(app: App, plugin: DangerzoneWritingPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        containerEl.createEl("h2", {text: "Dangerzone Writing Plugin"});

        new Setting(containerEl)
            .setName("Countdown Seconds")
            .setDesc("How many seconds you want your Dangerzone Writing session to last")
            .addText((text) =>
                text
                    .setPlaceholder("100")
                    .setValue(this.plugin.settings.countdownSeconds)
                    .onChange((value) => {
                        this.plugin.settings.countdownSeconds = value;
                        this.plugin.saveData(this.plugin.settings);
                    }));

        new Setting(containerEl)
            .setName("Dangerzone Seconds")
            .setDesc("How many seconds until your text is deleted")
            .addText((text) =>
                text
                    .setPlaceholder("100")
                    .setValue(this.plugin.settings.secondsUntilDeletion)
                    .onChange((value) => {
                        this.plugin.settings.secondsUntilDeletion = value;
                        this.plugin.saveData(this.plugin.settings);
                    }));
        containerEl.createEl("h3", {text: "Thanks"});
        containerEl.createEl("p", {text: "Thank you ryanjamurphy, roberthaisfield, macedotavares, afokapu, tristanbailey, lukeleppan, AutonomyGaps and hicsuntdragons for your feedback and support."});
        containerEl.createEl("a", {text: "Visit the forum for feedback", href: "https://forum.obsidian.md/t/dangerzone-flowstate-like-plugin-prototype/8776/"})

        containerEl.createEl("h3", {text: "Disclaimer"});
        containerEl.createEl("i", {text: "This plugin is provided as-is with no warranty that it'll work exactly as you expect. It's made to DELETE text in a note after X seconds of inactivity. Please do not hold me responsible if it does, in fact, DElETE your text. That's what it does."});
    }
}