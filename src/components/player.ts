// Authors: Omar Muhammad

import type Scene from './scene'
import type { Keys } from '../constants'

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
    _lives: number = 3
    isFiring: boolean = false

    scene: Scene
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    keys: Keys

    constructor(scene: Scene) {
        this.scene = scene
    }

    get x() { return this.sprite.x }
    get y() { return this.sprite.y }

    get lives() { return this._lives }
    set lives(value) {
        this._lives = value

        // rerender hearts UI
        this.scene.ui.renderLifeHearts()

        if (value <= 0) {
            // TODO: show "passed out" anim or disappear,
            // reset the level after player confirmation
        }
    }

    /**
     * Loads assets related to the player.
     */
    preload() {
        this.scene.load.image('fireball', 'assets/fireball.png')
        this.scene.load.spritesheet('dude', 'assets/dude.png', {
            frameWidth: 32,
            frameHeight: 48
        })
    }

    /**
     * Initializes the player sprite and animations.
     */
    create() {
        this.sprite = this.scene.physics.add.sprite(100, 450, 'dude')
            .setBounce(0.2)
            .setCollideWorldBounds(true)
        this.keys = Object.assign(this.scene.input.keyboard.createCursorKeys(), {
            enter: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
        })

        // initialize animations
        const prefix = 'dude'
        this.scene.anims.create({
            key: `${prefix}_left`,
            frames: this.scene.anims.generateFrameNumbers(prefix, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })
        this.scene.anims.create({
            key: `${prefix}_turn`,
            frames: [ { key: prefix, frame: 4 } ],
            frameRate: 20
        })
        this.scene.anims.create({
            key: `${prefix}_right`,
            frames: this.scene.anims.generateFrameNumbers(prefix, { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        })

        // add firing event
        // TODO: this should be changed to a cooldown system
        this.scene.time.addEvent({
            loop: true,
            delay: 1000,
            callback:  () => {
                if (!this.isFiring) return

                const fireball = this.scene.physics.add.sprite(this.sprite.x, this.sprite.y, 'fireball')
                fireball.setOrigin(0, 0)
                fireball.setVelocityX(this.lastDirection * 200)
                fireball.setImmovable(false)

                fireball.body.setAllowGravity(false)

                this.scene.time.addEvent({
                    delay: 5000,
                    callback: () => fireball.destroy()
                })
            }
        })
    }

    /**
     * Updates the position of the player based on the current inputs.
     */
    update() {
        // allow UI to capture input
        if (this.scene.ui.handleInput(this.keys)) return

        if (this.keys.left.isDown) {
            // move left
            this.lastDirection = Direction.Left
            this.sprite.setVelocityX(-X_VELOCITY)
            this.sprite.anims.play('dude_left', true)
        } else if (this.keys.right.isDown) {
            // move right
            this.lastDirection = Direction.Right
            this.sprite.setVelocityX(X_VELOCITY)
            this.sprite.anims.play('dude_right', true)
        } else {
            // stop moving
            this.sprite.setVelocityX(0)
            this.sprite.anims.play('dude_turn')
        }

        if (this.keys.up.isDown && this.sprite.body.touching.down) {
            // jump
            this.sprite.setVelocityY(-Y_VELOCITY)
        }

        // fire
        // TODO: improve controls for this when combat is implemented
        this.isFiring = this.keys.space.isDown
    }
}
