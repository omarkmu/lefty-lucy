export default class Victory extends Phaser.Scene {
    constructor() {
        super('victory')
    }

    create() {
        this.add.image(0, 0, 'victory').setOrigin(0)
        this.add.text(200, 250, "Thanks for Playing!", { font: "42px" })
    }
}