// Authors: Omar Muhammad
// Based on code from https://gamedevacademy.org/create-a-dialog-modal-plugin-in-phaser-3-part-1

import UI from './ui'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants'

const WIDTH = Math.floor(CANVAS_WIDTH * 0.75)
const HEIGHT = Math.floor(CANVAS_HEIGHT * 0.3)
const X = Math.floor((CANVAS_WIDTH - WIDTH) / 2)
const Y = CANVAS_HEIGHT - HEIGHT - 20
const DELAY = 50

const ALPHA = 0.8
const COLOR = 0x303030
const BORDER_ALPHA = 1
const BORDER_COLOR = 0x907748
const BORDER_THICKNESS = 3
const PADDING = 16

export default class DialogueBox {
    graphics: Phaser.GameObjects.Graphics
    text: Phaser.GameObjects.Text
    animateEvent: Phaser.Time.TimerEvent
    animating = false
    visible = false
    animateProgress = 0
    initialProgress = 0
    targetText = ''

    constructor(public ui: UI) {}

    create() {
        this.graphics = this.ui.scene.add.graphics()
            .setVisible(false)
            .setScrollFactor(0)
    }

    setText(text: string) {
        this.targetText = text
    }

    setInitialProgress(progress: number) {
        this.initialProgress = progress
    }

    skipAnimation() {
        if (!this.animating) return

        this.animateEvent?.remove()
        this.text.setText(this.targetText)
        this.animating = false
    }

    draw() {
        if (!this.graphics) return

        this.graphics.clear()

        // draw the border
        this.graphics.lineStyle(BORDER_THICKNESS, BORDER_COLOR, BORDER_ALPHA).strokeRect(X, Y, WIDTH, HEIGHT)

        // draw the box
        this.graphics.fillStyle(COLOR, ALPHA).fillRect(X + 1, Y + 1, WIDTH - 1, HEIGHT - 1)

        // draw the text
        this.text?.destroy()
        this.animateEvent?.remove()

        const text = this.ui.scene.make.text({
            x: X + PADDING,
            y: Y + PADDING,
            text: this.targetText.slice(0, this.initialProgress),
            visible: this.visible,
            scrollFactor: 0,
            style: {
                wordWrap: {
                    width: WIDTH - PADDING * 2
                }
            }
        })

        this.text = text
        this.animateProgress = this.initialProgress
        this.animating = true
        this.animateEvent = this.ui.scene.time.addEvent({
            delay: DELAY,
            loop: true,
            callback: () => {
                this.animateProgress++
                this.text.setText(this.targetText.slice(0, this.animateProgress))

                if (this.animateProgress === this.targetText.length) {
                    this.animateEvent?.remove()
                    this.animating = false
                }
            }
        })
    }

    show() {
        this.visible = true
        this.graphics.setVisible(true)
        this.text?.setVisible(true)
    }

    hide() {
        this.visible = false
        this.graphics.setVisible(false)
        this.text?.setVisible(false)
    }
}
