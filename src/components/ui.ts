// Authors: Omar Muhammad

import type Scene from './scene'

export default class UI {
    heartSprites: Phaser.GameObjects.Image[] = []

    constructor(public scene: Scene) {}

    preload() {
        // TODO: add heart image here
    }

    create() {
        this.renderLifeHearts()
    }

    renderLifeHearts() {
        // clear old life hearts, if present
        for (const sprite of this.heartSprites) {
            sprite.destroy()
        }

        let x = 0
        this.heartSprites = []
        for (let i = 0; i < this.scene.player.lives; i++) {
            const sprite = this.scene.add.image(x, 0, 'fireball')
            sprite.setOrigin(0)
            sprite.setScrollFactor(0) // ensure the sprites are always on screen

            x += sprite.width // updating the x such that they display left to right
            this.heartSprites.push(sprite)
        }
    }
}
