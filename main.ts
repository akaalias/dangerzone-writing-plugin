import { Notice, Plugin, addIcon, WorkspaceLeaf } from 'obsidian';

const svgPath = '<path d="M49.5122 90C29.3926 89.7355 13.1468 73.5337 12.8816 53.4685C13.1468 33.4032 29.3926 17.2014 49.5122 16.9369C69.6319 17.2014 85.8776 33.4032 86.1428 53.4685C85.8776 73.5337 69.6319 89.7355 49.5122 90ZM49.5122 25.0551C33.8635 25.2605 21.2278 37.8621 21.0217 53.4685C21.2278 69.0749 33.8635 81.6764 49.5122 81.8819C65.1609 81.6764 77.7967 69.0749 78.0027 53.4685C77.7967 37.8621 65.1609 25.2605 49.5122 25.0551ZM53.5823 73.7638H45.4421V57.5275H29.1619V49.4094H45.4421V33.1732H53.5823V49.4094H69.8625V57.5275H53.5823V73.7638ZM83.2612 27.9289L71.0144 15.7517L76.7491 10L89 22.1772L83.2612 27.9248V27.9289ZM15.7673 27.9289L10 22.1772L22.1736 10L27.9327 15.7476L15.7673 27.9248V27.9289Z" fill="#646464"/>'
addIcon('watch', svgPath);

export default class MyPlugin extends Plugin {

	statusBar: HTMLElement;
	countdown: CountdownTimer;
	cmEditors: CodeMirror.Editor[];

	onload() {
		this.statusBar = this.addStatusBarItem()
		this.cmEditors = [];

		this.addRibbonIcon('watch', 'Dangerzone Writing', () => {
			this.startTimer();
		});

		this.registerEvent(
		  this.app.on("codemirror", (cm: CodeMirror.Editor) => {
			this.cmEditors.push(cm);
			cm.on("keydown", this.handleKeyDown);
		  })
		);
	}

	onunload() {
		console.log('unloading plugin');
		this.cmEditors.forEach((cm) => {
			cm.off("keydown", this.handleKeyDown);
		});
	}

	startTimer() {
		let activeCmEditor = this.cmEditors[this.cmEditors.length - 1];
		let activeLeaf = this.app.workspace.activeLeaf;
		
		if(activeCmEditor) { 
			console.log(activeCmEditor);

			this.countdown = new CountdownTimer(100, activeCmEditor, this.statusBar, activeLeaf);	
		} else {
			new Notice("No editor open.");
		}
	}

	handleKeyDown = (
		cm: CodeMirror.Editor,
		event: KeyboardEvent
	  ): void => {
		  if(this.countdown) {
			  this.countdown.resetSecondUntilDeletion()
		  }
	};
}

class CountdownTimer {
	intervalId: NodeJS.Timeout;
	editor: CodeMirror.Editor;
	secondsUntilDeletion = 0;
	activeLeaf: WorkspaceLeaf;

	constructor(public counter = 10, editor: CodeMirror.Editor, statusBar: HTMLElement, activeLeaf: WorkspaceLeaf) {
		this.editor = editor;
		this.secondsUntilDeletion = 5;
		this.activeLeaf = activeLeaf;

		this.intervalId = setInterval(() => {

			this.counter = this.counter - 1;
			this.secondsUntilDeletion = this.secondsUntilDeletion - 1;

			if(this.secondsUntilDeletion <= 3 && editor.getValue().length > 0) {
				statusBar.setText(`${this.secondsUntilDeletion}`);
				statusBar.setAttr('style', 'color: red;');
			} else {
				statusBar.setText(`${this.counter} seconds left`);
				statusBar.setAttr('style', 'color: #999;');
			}

			if(this.secondsUntilDeletion <= 0) {
				this.editor.setValue('');
				this.secondsUntilDeletion = 5;
			}

			if(this.counter === 0) {
				statusBar.setText("");
				clearInterval(this.intervalId);
			}
		}, 1000)
		
	}
	
	resetSecondUntilDeletion() {
		this.secondsUntilDeletion = 5;
	}
}