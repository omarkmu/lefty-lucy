// Authors: Omar Muhammad

import { Direction, EnemyDefinition, SpawnLocation } from '../constants'
import Level from './level'

const VELOCITY = 100

const PAUSE_DELAY_MIN = 10000
const PAUSE_DELAY_MAX = 30000

const TURN_PAUSE_MIN = 600
const TURN_PAUSE_MAX = 1000

const RAND_PAUSE_MIN = 1000
const RAND_PAUSE_MAX = 3000

const FORGET_TIME = 1000

const enum AIMode {
    None,
    Stationary,
    Patrol,
    Pursue,
}

const DEFAULTS = {
    enemy: {
        health: 6,
        hearingRange: 115,
        visionRange: 350,
        attackRange: 40,
        attackDamage: 1,
        attackDelay: 1000,

    },
    boss: {
        health: 12,
        hearingRange: 115,
        visionRange: 350,
        attackRange: 40,
        attackDamage: 2,
        attackDelay: 800,

    }
}

export default class Enemy {
    type: 'enemy' | 'boss'
    lastDirection: Direction

    hearingRange: number
    visionRange: number
    spawn: SpawnLocation
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

    health: number
    initialDirection: Direction
    currentPlatform: Phaser.Types.Physics.Arcade.GameObjectWithBody

    attackDamage: number
    attackDelay: number
    attackRange: number

    defaultMode: AIMode
    currentMode: AIMode

    playerDistance: number
    lastAttack: number = 0
    lastSeenPlayer: number = 0

    canRandomPause: boolean = false
    canPauseEvent: Phaser.Time.TimerEvent
    savedVelocity: number

    minX?: number
    maxX?: number

    constructor(public scene: Level, def: EnemyDefinition) {
        this.spawn = {
            x: def.spawn[0],
            y: def.spawn[1]
        }

        this.type = def.type ?? 'enemy'
        this.health = def.health ?? DEFAULTS[this.type].health
        this.hearingRange = def.hearingRange ?? DEFAULTS[this.type].hearingRange
        this.visionRange = def.visionRange ?? DEFAULTS[this.type].visionRange
        this.attackRange = def.attackRange ?? DEFAULTS[this.type].attackRange
        this.attackDamage = def.attackDamage ?? DEFAULTS[this.type].attackDamage
        this.attackDelay = def.attackDelay ?? DEFAULTS[this.type].attackDelay
        this.minX = def.patrolRange?.[0]
        this.maxX = def.patrolRange?.[1]

        const isPatrolEnabled = def.disablePatrol !== true
        this.currentMode = this.defaultMode = isPatrolEnabled ? AIMode.Patrol : AIMode.Stationary

        this.initialDirection = def.initialDirection ?? Phaser.Math.Between(1, 2) === 1
            ? Direction.Left
            : Direction.Right
        this.lastDirection = this.initialDirection

        this.create()
    }

    get x() { return this.sprite.body.x }
    get y() { return this.sprite.body.y }
    get isDead() { return this.health <= 0 }

    create() {
        const direction = this.lastDirection === Direction.Left ? 'left' : 'right'
        const sprite = this.scene.enemyGroup.create(this.spawn.x, this.spawn.y, `${this.type}_walk`)
            .setCollideWorldBounds(true)

        sprite.owner = this
        this.sprite = sprite
        this.sprite.body.velocity.x = this.initialDirection * VELOCITY
    }

    update() {
        this.playerDistance = Phaser.Math.Distance.BetweenPoints(this.sprite, this.scene.player.sprite)

        this.tryCombat()
        this.tryPatrol()

        if (this.sprite.body.velocity.x < 0) {
            this.lastDirection = Direction.Left
            this.sprite.anims.play(`${this.type}_walk_left`, true)
        } else if (this.sprite.body.velocity.x > 0) {
            this.lastDirection = Direction.Right
            this.sprite.anims.play(`${this.type}_walk_right`, true)
        } else if (this.scene.time.now - this.lastAttack > this.attackDelay) {
            const direction = this.lastDirection === Direction.Left ? 'left' : 'right'
            this.sprite.anims.play(`${this.type}_stand_${direction}`, true)
        }
    }

    alert() {
        this.currentMode = AIMode.Pursue
    }

    tryCombat() {
        const dist = this.playerDistance
        const velX = this.sprite.body.velocity.x
        const x = this.x

        const isPlayerBehind = (velX > 0 && this.scene.player.x < x) || (velX < 0 && this.scene.player.x > x)
        const isWithinY = Phaser.Math.Distance.Between(0, this.sprite.y, 0, this.scene.player.y) <= this.sprite.height / 2
        const isPlayerWithinRange = isWithinY && (dist <= this.hearingRange || (dist <= this.visionRange && !isPlayerBehind))

        const now = this.scene.time.now
        if (!isPlayerWithinRange) {
            if (now - this.lastSeenPlayer >= FORGET_TIME) {
                this.currentMode = this.defaultMode
            }

            if (this.currentMode !== AIMode.Pursue) {
                return
            }
        }

        this.lastSeenPlayer = now
        this.currentMode = AIMode.Pursue

        const isWithinAttackRange = dist < this.attackRange
        if (!isWithinAttackRange) {
            const minX = this.minX ?? this.currentPlatform?.body.x ?? 0
            const maxX = this.maxX ?? this.currentPlatform?.body.width ?? this.scene.background.width
            const isWithinX = Phaser.Math.Distance.Between(x, 0, this.scene.player.x, 0) < this.sprite.width / 2

            // follow player
            if (!isWithinX && x < maxX && x < this.scene.player.x) {
                this.sprite.setVelocityX(VELOCITY)
            } else if (!isWithinX && x > this.scene.player.x && x > minX) {
                this.sprite.setVelocityX(-VELOCITY)
            } else {
                this.sprite.setVelocityX(0)
            }

            return
        }

        // TODO: animate, sound effect, and delay to give the player time to dodge
        if (now - this.lastAttack >= this.attackDelay) {
            this.lastAttack = now
            this.scene.player.applyDamage(this.attackDamage)

            const direction = this.lastDirection === Direction.Left ? 'left' : 'right'
            this.sprite.anims.play(`${this.type}_punch_${direction}`)
            this.sprite.setVelocityX(0)
        }
    }

    tryPatrol() {
        if (this.currentMode !== AIMode.Patrol) return

        // pause the enemy's movement randomly
        if (this.canRandomPause) {
            this.pauseMovement(true)
            return
        }

        const minX = this.minX ?? this.currentPlatform?.body.x ?? 0
        const maxX = this.maxX ?? this.currentPlatform?.body.width ?? this.scene.background.width
        const x = this.sprite.body.x

        if (x <= minX || x >= maxX - this.sprite.width) {
            this.sprite.setVelocityX(VELOCITY * (x <= minX ? 1 : -1))
            this.pauseMovement()
        }
    }

    applyDamage(health: number) {
        this.health -= health

        // TODO: sound effects, animation
        if (this.health <= 0) {
            this.sprite.destroy()
        }
    }

    /**
     * Momentarily pause enemy movement before resuming patrol.
     */
    pauseMovement(random = false) {
        const oldVelocity = this.sprite.body.velocity.x
        this.sprite.setVelocityX(0)
        this.currentMode = AIMode.Stationary

        const pauseMin = random ? RAND_PAUSE_MIN : TURN_PAUSE_MIN
        const pauseMax = random ? RAND_PAUSE_MAX : TURN_PAUSE_MAX

        // resume movement after delay
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(pauseMin, pauseMax),
            callback: () => {
                if (!this.sprite || this.currentMode !== AIMode.Stationary) return
                this.sprite.setVelocityX(oldVelocity)
                this.currentMode = this.defaultMode
            }
        })

        this.canRandomPause = false
        this.canPauseEvent?.remove()
        this.canPauseEvent = this.scene.time.addEvent({
            delay: Phaser.Math.Between(PAUSE_DELAY_MIN, PAUSE_DELAY_MAX),
            callback: () => this.canRandomPause = true
        })
    }
}
