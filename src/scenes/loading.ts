// Authors: Omar Muhammad
// Adapted from https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3


const ELLIPSIS_DELAY = 250

// not extending the base scene; this is a special case
export default class LoadingScreen extends Phaser.Scene {
    ellipsisEvent: Phaser.Time.TimerEvent

    drawLoadingElements() {
        const progressBar = this.add.graphics()
        const progressBox = this.add.graphics()
        progressBox.fillStyle(0x222222, 0.8)
        progressBox.fillRect(240, 270, 320, 50)

        const width = this.cameras.main.width
        const height = this.cameras.main.height
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading',
            style: {
                font: '20px monospace',
                stroke: '#ffffff'
            },
            origin: 0.5
        })

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                stroke: '#ffffff'
            },
            origin: 0.5
        })

        let i = 0
        this.ellipsisEvent = this.time.addEvent({
            loop: true,
            delay: ELLIPSIS_DELAY,
            callback: () => loadingText.setText(`Loading${'.'.repeat(1 + i++ % 3)}`)
        })

        this.load.on('progress', (value: number) => {
            percentText.setText(parseInt((value * 100) as any) + '%')
            progressBar.clear()
            progressBar.fillStyle(0xffffff, 1)
            progressBar.fillRect(250, 280, 300 * value, 30)
        })

        this.load.on('complete', () => {
            progressBar.destroy()
            progressBox.destroy()
            loadingText.destroy()
            percentText.destroy()
        })
    }

    preload() {
        this.drawLoadingElements()

        // ui assets
        this.load.image('heart', 'assets/heart.png')

        // level assets
        this.load.image('bg', 'assets/forest_background.png')
        this.load.image('home', 'assets/lucyhousebackground2.png')
        this.load.image('forestpath', 'assets/forest_background.png')
        this.load.image('town', 'assets/town_background.png')
        this.load.image('mountainpath', 'assets/mountain_background.png')
        this.load.image('cave', 'assets/cave_background.png')
        this.load.image('cavepath', 'assets/innercave.png')
        this.load.image('platform', 'assets/5.png')
        this.load.image('sideways', 'assets/sideways.png')

        // player assets
        this.load.image('fireball', 'assets/fireball.png')
        this.load.spritesheet('dude', 'assets/dude.png', {
            frameWidth: 32,
            frameHeight: 48
        })
    }

    create() {
        this.ellipsisEvent?.remove()
        // TODO: change to main menu
        this.scene.start('main-menu')
    }
}
