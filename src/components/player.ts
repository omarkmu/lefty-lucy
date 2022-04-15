// Authors: Omar Muhammad
// Camera code from https://github.com/photonstorm/phaser3-examples/blob/master/public/src/camera/follow%20zoom%20tilemap.js

import type Scene from './scene'
import { Direction, Keys, SpawnLocation } from '../constants'

const keyJustDown = Phaser.Input.Keyboard.JustDown

const INVINCIBILITY_DELAY = 650
const X_VELOCITY = 160
const Y_VELOCITY = 200
const FIREBALL_VELOCITY = 200
const MELEE_COOLDOWN = 100
const MELEE_RANGE = 10
const FIREBALL_COOLDOWN = 600
const FIREBALL_DESTROY_DELAY = 5000
const ATTACK_COOLDOWNS = [MELEE_COOLDOWN, FIREBALL_COOLDOWN]

/**
 * Keeps track of player information and manages input.
 * This is not just the player sprite; see the sprite property.
 */
export default class Player {
    _lives: number = 3 // remaining lives
    lastDirection: Direction = Direction.Right // default to right because stages are left to right
    isInvincible: boolean = false

    // 0 = melee, 1 = fireball
    attackCooldownState = [false, false]
    attackTrigger = [false, false]

    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    keys: Keys

    constructor(public scene: Scene, public spawn: SpawnLocation) { }

    get x() { return this.sprite.x }
    get y() { return this.sprite.y }

    get isMeleeOnCooldown() { return this.attackCooldownState[0] }
    get isFireballOnCooldown() { return this.attackCooldownState[1] }

    get lives() { return this._lives }
    set lives(value) {
        if (value < this._lives) {
            // TODO: hurt sound effect
        } else if (value > this._lives) {
            // TODO: (maybe) heal sound effect
        } else {
            return
        }

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
        const sprite: any = this.scene.physics.add.sprite(this.spawn.x, this.spawn.y, 'dude')
            .setCollideWorldBounds(true)
        
        sprite.owner = this
        this.sprite = sprite

        this.keys = {
            up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            space: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            interact: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            enter: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
        }

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

        // disable attacking in non-combat levels
        if (!this.scene.isCombatLevel) return

        this.scene.input.mouse.disableContextMenu()
        this.scene.input.on('pointerdown', (mouse: any) => {
            if (mouse.button !== 0 && mouse.button !== 2) return

            // convert 0 to 0, 2 to 1
            const button = Math.floor(mouse.button / 2)

            // if the attack is on cooldown, ignore
            if (this.attackCooldownState[button]) return

            // set the attack to be triggered on the next update
            this.attackTrigger[button] = true

            // set the attack cooldown
            this.attackCooldownState[button] = true
            this.scene.time.addEvent({
                delay: ATTACK_COOLDOWNS[button],
                callback: () => this.attackCooldownState[button] = false
            })
        })
    }

    /**
     * Updates the position of the player based on the current inputs.
     */
    update() {
        // allow UI to capture input
        if (this.scene.ui.handleInput(this.keys)) return

        if (this.keys.left.isDown) {
            this.lastDirection = Direction.Left
            this.sprite.setVelocityX(-X_VELOCITY)
            this.sprite.anims.play('dude_left', true)
        } else if (this.keys.right.isDown) {
            this.lastDirection = Direction.Right
            this.sprite.setVelocityX(X_VELOCITY)
            this.sprite.anims.play('dude_right', true)
        } else {
            this.sprite.setVelocityX(0)
            this.sprite.anims.play('dude_turn')
        }

        const jumpRequested = keyJustDown(this.keys.up) || keyJustDown(this.keys.space)
        if (jumpRequested && this.sprite.body.touching.down) {
            this.sprite.setVelocityY(-Y_VELOCITY)
        }

        // TODO: melee
        if (this.attackTrigger[0]) {
            this.attackTrigger[0] = false
        }

        // fireball
        if (this.attackTrigger[1]) {
            this.attackTrigger[1] = false

            const xOffset = this.lastDirection === -1 ? -40 : 20
            const fireball = this.scene.playerProjectiles.create(this.sprite.x + xOffset, this.sprite.y, 'fireball')
                .setOrigin(0)
                .setVelocityX(this.lastDirection * FIREBALL_VELOCITY)
                .setImmovable(false)

            fireball.body.setAllowGravity(false)
            fireball.damage = 1

            this.scene.time.addEvent({
                delay: FIREBALL_DESTROY_DELAY,
                callback: () => fireball.destroy()
            })
        }
    }

    applyDamage(lives: number) {
        if (this.isInvincible) return

        this.lives -= lives
        if (this.lives <= 0) return

        // so the player doesn't get hurt too quickly, temporary invincibility
        this.isInvincible = true
        this.scene.time.addEvent({
            delay: INVINCIBILITY_DELAY,
            callback: () => this.isInvincible = false
        })
    }
}
