//code used from https://blog.ourcade.co/posts/2020/phaser-3-ui-menu-selection-cursor-selector/
//edited by Eric Burch
//glassPanel and cursor_pointerFlat_shadow from https://kenney.nl/assets/ui-pack-space-expansion

export default class MainMenuScene extends Phaser.Scene {
    private cursors!: any
    private buttons: Phaser.GameObjects.Image[] = []
    private selectedButtonIndex = 0
    private buttonSelector!: Phaser.GameObjects.Image

    constructor() {
        super('main-menu')
    }

    init() {
        this.cursors = {
            enter: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        }
    }

    create() {
        const { width, height } = this.scale

        this.add.image(0, 0, 'menu').setOrigin(0)

        // Play button
        const playButton = this.add.image(width * 0.5, height * 0.6, 'glass-panel')
            .setDisplaySize(150, 50)

        this.add.text(playButton.x, playButton.y, 'Play')
            .setOrigin(0.5)

        playButton.on('selected', () => this.scene.start('backstory'))

        this.buttons.push(playButton)

        this.buttonSelector = this.add.image(0, 0, 'cursor_pointerFlat_shadow')
        this.selectButton(0)

        this.add.text(275, 200, "Lefty Lucy", { font: "42px" })
        this.add.text(285, 250, "Press Enter to Play!")
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
        const enterJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.enter!)

        if (upJustPressed) {
            this.selectNextButton(-1)
        }
        else if (downJustPressed) {
            this.selectNextButton(1)
        }
        else if (enterJustPressed) {
            this.confirmSelection()
        }
    }
}