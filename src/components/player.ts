// Authors: Omar Muhammad

import type * as Phaser from 'phaser'
import Scene from './scene'

const X_VELOCITY = 160
const Y_VELOCITY = 300

const enum Direction {
    Left = -1,
    Right = 1
}

/**
 * Keeps track of player information and manages input.
 * This is not just the player sprite; see the sprite property.
 */
export default class Player {
    // defaulting to right because stages are left to right
    lastDirection: Direction = Direction.Right
    // remaining lives
    lives: number = 3
    isFiring: boolean = false

    scene: Scene
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    cursors: Phaser.Types.Input.Keyboard.CursorKeys

    constructor(scene: Scene) {
        const sprite = scene.physics.add.sprite(100, 450, 'dude')
        sprite.setBounce(0.2)
        sprite.setCollideWorldBounds(true)

        // initialize animations
        const prefix = 'dude'
        scene.anims.create({
            key: `${prefix}_left`,
            frames: scene.anims.generateFrameNumbers(prefix, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })
        scene.anims.create({
            key: `${prefix}_turn`,
            frames: [ { key: prefix, frame: 4 } ],
            frameRate: 20
        })
        scene.anims.create({
            key: `${prefix}_right`,
            frames: scene.anims.generateFrameNumbers(prefix, { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        })

        // add firing event
        // TODO: this should be changed to a cooldown system
        scene.time.addEvent({
            loop: true,
            delay: 1000,
            callback:  () => {
                if (!this.isFiring) return

                const fireball = scene.physics.add.sprite(this.sprite.x, this.sprite.y, 'fireball')
                fireball.setOrigin(0, 0)
                fireball.setVelocityX(this.lastDirection * 200)
                fireball.setImmovable(false)

                fireball.body.setAllowGravity(false)

                scene.time.addEvent({
                    delay: 5000,
                    callback: () => fireball.destroy()
                })
            }
        })

        this.scene = scene
        this.sprite = sprite
        this.cursors = scene.input.keyboard.createCursorKeys()
    }

    get x() { return this.sprite.x }
    get y() { return this.sprite.y }

    /**
     * Updates the position of the player based on the current inputs.
     */
    update() {
        if (this.cursors.left.isDown) {
            // move left
            this.lastDirection = Direction.Left
            this.sprite.setVelocityX(-X_VELOCITY)
            this.sprite.anims.play('dude_left', true)
        } else if (this.cursors.right.isDown) {
            // move right
            this.lastDirection = Direction.Right
            this.sprite.setVelocityX(X_VELOCITY)
            this.sprite.anims.play('dude_right', true)
        } else {
            // stop moving
            this.sprite.setVelocityX(0)
            this.sprite.anims.play('dude_turn')
        }

        if (this.cursors.up.isDown && this.sprite.body.touching.down) {
            // jump
            this.sprite.setVelocityY(-Y_VELOCITY)
        }

        // fire
        // TODO: improve controls for this when combat is implemented
        this.isFiring = this.cursors.space.isDown
    }
}
