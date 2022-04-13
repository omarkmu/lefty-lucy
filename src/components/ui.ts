// Authors: Omar Muhammad

import type Scene from './scene'

// the amount to add to the X position of each heart
const HEART_OFFSET = -8

export default class UI {
    heartSprites: Phaser.GameObjects.Image[] = []

    constructor(public scene: Scene) {}

    preload() {
        this.scene.load.image('heart', 'assets/heart.png')
    }

    create() {
        // don't render hearts in the overworld
        if (this.scene.isCombatLevel) {
            this.renderLifeHearts()
        }
    }

    removeLifeHearts() {
        // clear old life hearts, if present
        for (const sprite of this.heartSprites) {
            sprite.destroy()
        }

        this.heartSprites = []
    }

    renderLifeHearts() {
        this.removeLifeHearts()

        for (let i = 0; i < this.scene.player.lives; i++) {
            const sprite = this.scene.add.image(0, 0, 'heart')
            sprite.setX(i * (sprite.width + HEART_OFFSET)) // update the x such that hearts display left to right
            sprite.setOrigin(0)
            sprite.setScrollFactor(0) // ensure the sprites are always on screen

            this.heartSprites.push(sprite)
        }
    }
}
