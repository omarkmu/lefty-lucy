//code used from https://blog.ourcade.co/posts/2020/phaser-3-ui-menu-selection-cursor-selector/
//edited by Eric Burch
//glassPanel and cursor_pointerFlat_shadow from https://kenney.nl/assets/ui-pack-space-expansion

import Phaser from 'phaser'

export default class MainMenuScene extends Phaser.Scene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    private buttons: Phaser.GameObjects.Image[] = []
    private selectedButtonIndex = 0
    private buttonSelector!: Phaser.GameObjects.Image

    constructor() {
        super('main-menu')
    }

    init() {
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    preload() {
        this.load.image('glass-panel', 'assets/glassPanel.png')
        this.load.image('cursor_pointerFlat_shadow', 'assets/cursor_pointerFlat_shadow.png')
    }

    create() {
        {
            const { width, height } = this.scale

            // Play button
            const playButton = this.add.image(width * 0.5, height * 0.6, 'glass-panel')
                .setDisplaySize(150, 50)

            this.add.text(playButton.x, playButton.y, 'Play')
                .setOrigin(0.5)

            playButton.on('selected', () => {
                console.log('play')
            })

            const continueButton = this.add.image(playButton.x, playButton.y + playButton.displayHeight + 10, 'glass-panel')
                .setDisplaySize(150, 50)

            this.add.text(continueButton.x, continueButton.y, 'Continue')
                .setOrigin(0.5)

            playButton.on('selected', () => {
                console.log('continue')
            })

            this.buttons.push(playButton)
            this.buttons.push(continueButton)

            this.buttonSelector = this.add.image(0, 0, 'cursor_pointerFlat_shadow')
            this.selectButton(0)

            let title_text = this.add.text(275, 200, "Lefty Lucy", { font: "42px" })
            this.add.text(200, 250, "Arrow Keys to move Space Bar to Select")

        }
    }

    selectButton(index: number) {
        const currentButton = this.buttons[this.selectedButtonIndex]

        // set the current selected button to a white tint
        currentButton.setTint(0xffffff)

        const button = this.buttons[index]

        // set the newly selected button to a green tint
        button.setTint(0x66ff7f)

        // move the hand cursor to the right edge
        this.buttonSelector.x = button.x + button.displayWidth * 0.5
        this.buttonSelector.y = button.y + 10

        // store the new selected index
        this.selectedButtonIndex = index
    }

    selectNextButton(change = 1) {
        let index = this.selectedButtonIndex + change

        // wrap the index to the front or end of array
        if (index >= this.buttons.length) {
            index = 0
        }
        else if (index < 0) {
            index = this.buttons.length - 1
        }

        this.selectButton(index)
    }

    confirmSelection() {
        // get the currently selected button
        const button = this.buttons[this.selectedButtonIndex]

        // emit the 'selected' event
        button.emit('selected')
    }

    update() {
        const upJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up!)
        const downJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.down!)
        const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space!)

        if (upJustPressed) {
            this.selectNextButton(-1)
        }
        else if (downJustPressed) {
            this.selectNextButton(1)
        }
        else if (spaceJustPressed) {
            this.confirmSelection()
        }
    }
}