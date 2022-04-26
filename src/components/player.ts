// Authors: Omar Muhammad
// Camera code from https://github.com/photonstorm/phaser3-examples/blob/master/public/src/camera/follow%20zoom%20tilemap.js

import type Level from './level'
import { Direction, Keys, SpawnLocation } from '../constants'

const keyJustDown = Phaser.Input.Keyboard.JustDown

const INVINCIBILITY_DELAY = 100
const X_VELOCITY = 160
const Y_VELOCITY = 250

const MELEE_COOLDOWN = 500
const MELEE_RANGE = 50
const MELEE_DAMAGE = 2

const SWORD_COOLDOWN = 200
const SWORD_RANGE = 100
const SWORD_DAMAGE = 6

const FIREBALL_COOLDOWN = 550
const FIREBALL_VELOCITY = 200
const FIREBALL_DESTROY_DELAY = 2000
const FIREBALL_DAMAGE = 5

const REGEN_DELAY = 5000

const MAX_LIVES = 3


/**
 * Keeps track of player information and manages input.
 * This is not just the player sprite; see the sprite property.
 */
export default class Player {
    lastDirection: Direction

    _lives: number = MAX_LIVES // remaining lives
    isInvincible: boolean = false

    // 0 = melee, 1 = fireball
    attackCooldowns = [MELEE_COOLDOWN, FIREBALL_COOLDOWN]
    attackCooldownState = [false, false]
    attackTrigger = [false, false]
    attackX = [0, 0]
    attackY = [0, 0]

    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    keys: Keys

    regenEvent: Phaser.Time.TimerEvent
    regenConfig: any

    spawn: SpawnLocation
    isFireballEnabled: boolean
    isSwordEnabled: boolean

    constructor(public scene: Level, private _options: PlayerOptions) {
        this.spawn = _options.spawn
        this.isFireballEnabled = _options.isFireballEnabled
        this.isSwordEnabled = _options.isSwordEnabled

        if (this.isSwordEnabled) {
            this.attackCooldowns[0] = SWORD_COOLDOWN
        }

        this.create()
    }

    get x() { return this.sprite.body.x }
    get y() { return this.sprite.body.y }

    get isMeleeOnCooldown() { return this.attackCooldownState[0] }
    get isFireballOnCooldown() { return this.attackCooldownState[1] }

    get lives() { return this._lives }
    set lives(value) {
        if (value === this.lives) {
            return
        }

        if (value < this._lives) {
            this.scene.sound.play('hurt')
            this.regenEvent.reset(this.regenConfig)
        } else {
            this.scene.sound.play('heal')
        }

        this._lives = value

        // rerender hearts UI
        this.scene.ui.renderLifeHearts()

        if (value <= 0) {
            this.scene.onPlayerDied()
        }
    }

    /**
     * Initializes the player sprite and animations.
     */
    create() {
        this.lastDirection = Direction.Right

        const sprite: any = this.scene.physics.add.sprite(this.spawn?.x ?? 0, this.spawn?.y ?? 0, 'lucy_walk')
            .setCollideWorldBounds(true)

        sprite.owner = this
        this.sprite = sprite
        sprite.setVisible(this._options.visible)

        this.keys = {
            up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            space: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            interact: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            enter: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
        }

        // disable attacking in non-combat levels
        if (!this.scene.isCombatLevel) return

        this.scene.input.mouse.disableContextMenu()
        this.scene.input.on('pointerdown', (mouse: any) => {
            if (mouse.button !== 0 && mouse.button !== 2) return

            // convert 0 to 0, 2 to 1
            const button = Math.floor(mouse.button / 2)

            // if the attack is on cooldown, ignore
            if (this.attackCooldownState[button]) return

            // disallow punching while jumping
            if (button === 0 && this.sprite.body.velocity.y !== 0) return

            // disallow fireball on non-fireball enabled levels
            if (button === 1 && !this.isFireballEnabled) return

            // set the attack to be triggered on the next update
            this.attackTrigger[button] = true
            this.attackX[button] = mouse.position.x
            this.attackY[button] = mouse.position.y

            // set the attack cooldown
            this.attackCooldownState[button] = true
            this.scene.time.addEvent({
                delay: this.attackCooldowns[button],
                callback: () => this.attackCooldownState[button] = false
            })
        })

        this.regenConfig = {
            delay: REGEN_DELAY,
            loop: true,
            callback: () => {
                if (this.lives < MAX_LIVES) {
                    this.lives += 1
                }
            }
        }

        this.regenEvent = this.scene.time.addEvent(this.regenConfig)
    }

    /**
     * Updates the position of the player based on the current inputs.
     */
    update() {
        // allow UI to capture input
        if (this.scene.ui.handleInput(this.keys)) return

        let velMultiplier = 0
        if (this.keys.left.isDown) {
            this.lastDirection = Direction.Left
            velMultiplier = -1
        } else if (this.keys.right.isDown) {
            this.lastDirection = Direction.Right
            velMultiplier = 1
        }

        this.sprite.setVelocityX(X_VELOCITY * velMultiplier)

        const jumpRequested = keyJustDown(this.keys.up) || keyJustDown(this.keys.space)
        if (jumpRequested && this.sprite.body.touching.down) {
            this.sprite.setVelocityY(-Y_VELOCITY)
        }

        let direction = this.lastDirection === Direction.Left ? 'left' : 'right'
        const swordModifier = this.isSwordEnabled ? 'sword_' : ''
        if (!this.sprite.body.touching.down) {
            this.sprite.anims.play(`lucy_jump_${swordModifier}${direction}`, true)
        } else if (velMultiplier < 0) {
            this.lastDirection = Direction.Left
            this.sprite.anims.play(`lucy_walk_${swordModifier}left`, true)
        } else if (velMultiplier > 0) {
            this.lastDirection = Direction.Right
            this.sprite.anims.play(`lucy_walk_${swordModifier}right`, true)
        } else if (!this.attackCooldownState[0] && !this.attackCooldownState[1]) {
            this.sprite.anims.play(`lucy_stand_${swordModifier}${direction}`, true)
        }

        // melee
        if (this.attackTrigger[0]) {
            const meleeType = this.isSwordEnabled ? 'sword' : 'punch'

            this.attackTrigger[0] = false
            this.lastDirection = this.tryPunch()

            direction = this.lastDirection === Direction.Left ? 'left' : 'right'
            this.sprite.anims.play(`lucy_${meleeType}_${direction}`, true)
        }

        // fireball
        if (this.attackTrigger[1]) {
            this.attackTrigger[1] = false
            this.lastDirection = this.createFireball()
            direction = this.lastDirection === Direction.Left ? 'left' : 'right'
            this.sprite.anims.play(`lucy_jump_${direction}`, true)
            this.scene.sound.play('swoosh')
        }

        // npc interaction
        if (keyJustDown(this.keys.interact)) {
            for (const npc of this.scene.npcs) {
                if (npc.playerCanInteract) {
                    npc.startInteraction()
                    break
                }
            }
        }
    }

    determineAttackDirection(attack: 0 | 1) {
        if (this.sprite.body.velocity.x < 0) {
            return Direction.Left
        } else if (this.sprite.body.velocity.x > 0) {
            return Direction.Right
        }

        // if the avatar isn't moving, determine attack direction based on click location relative to avatar
        // source: https://stevenklambert.com/writing/phaser-3-game-object-position-relative-camera
        const playerX = (this.sprite.x - this.scene.cameras.main.worldView.x) * this.scene.cameras.main.zoom
        return (playerX > this.attackX[attack]) ? Direction.Left : Direction.Right
    }

    tryPunch() {
        const direction = this.determineAttackDirection(0)
        const validTargets = []
        for (const enemy of this.scene.enemies) {
            const isInvalidTarget = enemy.isDead
                || (enemy.playerDistance === undefined)
                || (enemy.playerDistance > (this.isSwordEnabled ? SWORD_RANGE : MELEE_RANGE))
                || (direction === Direction.Left && enemy.x > this.x)
                || (direction === Direction.Right && enemy.x < this.x)

            if (!isInvalidTarget) {
                validTargets.push(enemy)
            }
        }

        validTargets.sort((a, b) => b.playerDistance - a.playerDistance)

        const target = validTargets.pop()
        if (this.isSwordEnabled || target) this.scene.sound.play(this.isSwordEnabled ? 'sword' : 'punch')
        if (!target) return direction

        target.applyDamage(this.isSwordEnabled ? SWORD_DAMAGE : MELEE_DAMAGE)
        target.alert()
        return direction
    }

    createFireball() {
        const direction = this.determineAttackDirection(1)
        const xOffset = direction === Direction.Left ? -40 : 20
        const fireball = this.scene.playerProjectiles.create(this.sprite.x + xOffset, this.sprite.y, 'fireball')
            .setOrigin(0)
            .setVelocityX(direction * FIREBALL_VELOCITY)
            .setImmovable(false)

        fireball.body.setAllowGravity(false)
        fireball.damage = FIREBALL_DAMAGE

        this.scene.time.addEvent({
            delay: FIREBALL_DESTROY_DELAY,
            callback: () => fireball.destroy()
        })

        return direction
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

interface PlayerOptions {
    spawn: SpawnLocation
    isFireballEnabled: boolean
    isSwordEnabled: boolean
    visible: boolean
}