// Authors: Omar Muhammad

import { Direction, EnemyDefinition, SpawnLocation } from '../constants'
import Scene from './scene'

const VELOCITY = 100

const PAUSE_DELAY_MIN = 10000
const PAUSE_DELAY_MAX = 30000

const TURN_PAUSE_MIN = 600
const TURN_PAUSE_MAX = 1000

const RAND_PAUSE_MIN = 1000
const RAND_PAUSE_MAX = 3000

const FORGET_TIME = 1000

export default class Enemy {
    static preload(scene: Scene) {
        // TODO: change this to an enemy sprite (or multiple, depending on enemy type)
        scene.load.spritesheet('dude', 'assets/dude.png', {
            frameWidth: 32,
            frameHeight: 48
        })
    }

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
    playerDistance: number
    isTargetingPlayer: boolean = false
    lastAttack: number = 0
    lastSeenPlayer: number = 0

    isPatrolEnabled: boolean
    isPatrolPaused: boolean = false
    canRandomPause: boolean = false
    canPauseEvent: Phaser.Time.TimerEvent
    savedVelocity: number

    minX?: number
    maxX?: number

    constructor(public scene: Scene, def: EnemyDefinition) {
        this.spawn = {
            x: def.spawn[0],
            y: def.spawn[1]
        }

        this.health = def.health ?? 1
        this.hearingRange = def.hearingRange ?? 115
        this.visionRange = def.visionRange ?? 350
        this.attackRange = def.attackRange ?? 40
        this.attackDamage = def.attackDamage ?? 1
        this.attackDelay = def.attackDelay ?? 1000
        this.minX = def.patrolRange?.[0]
        this.maxX = def.patrolRange?.[1]
        this.isPatrolEnabled = def.disablePatrol !== true

        this.initialDirection = Phaser.Math.Between(1, 2) === 1
            ? Direction.Left
            : Direction.Right
    }

    get isDead() { return this.health <= 0 }

    create() {
        const sprite = this.scene.enemyGroup.create(this.spawn.x, this.spawn.y, 'dude')
            .setCollideWorldBounds(true)

        sprite.owner = this
        this.sprite = sprite
        this.sprite.body.velocity.x = this.initialDirection * VELOCITY
    }

    update() {
        this.playerDistance = Phaser.Math.Distance.BetweenPoints(this.sprite, this.scene.player.sprite)

        this.tryCombat()
        if (this.isPatrolEnabled && !this.isTargetingPlayer) {
            this.patrol()
        }

        if (this.sprite.body.velocity.x > 0) {
            this.sprite.anims.play('dude_right', true)
        } else if (this.sprite.body.velocity.x < 0) {
            this.sprite.anims.play('dude_left', true)
        } else {
            this.sprite.anims.play('dude_turn')
        }
    }

    tryCombat() {
        const dist = this.playerDistance
        const velX = this.sprite.body.velocity.x
        const x = this.sprite.x

        const isPlayerBehind = (velX > 0 && this.scene.player.x < x) || (velX < 0 && this.scene.player.x > x)
        const isWithinY = Phaser.Math.Distance.Between(0, this.sprite.y, 0, this.scene.player.y) <= this.sprite.height / 2
        const isPlayerWithinRange = isWithinY && (dist <= this.hearingRange || (dist <= this.visionRange && !isPlayerBehind))

        const now = this.scene.time.now
        if (!isPlayerWithinRange) {
            if (now - this.lastSeenPlayer >= FORGET_TIME) {
                this.isTargetingPlayer = false
            }

            if (!this.isTargetingPlayer) {
                return
            }
        }

        this.isTargetingPlayer = true
        this.lastSeenPlayer = now

        const isWithinAttackRange = dist < this.attackRange
        if (!isWithinAttackRange) {
            const minX = this.minX ?? this.currentPlatform?.body.x ?? 0
            const maxX = this.maxX ?? this.currentPlatform?.body.width ?? this.scene.background.width

            // follow player
            if (x < this.scene.player.x && x < maxX) {
                this.sprite.setVelocityX(VELOCITY)
            } else if (x > this.scene.player.x && x > minX) {
                this.sprite.setVelocityX(-VELOCITY)
            } else {
                this.sprite.setVelocityX(0)
            }

            return
        }

        if (isWithinAttackRange && now - this.lastAttack >= this.attackDelay) {
            this.lastAttack = now
            this.scene.player.applyDamage(this.attackDamage)
            this.sprite.setVelocityX(0)
        }
    }

    patrol() {
        if (this.isPatrolPaused) return

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
        this.isPatrolPaused = true

        const pauseMin = random ? RAND_PAUSE_MIN : TURN_PAUSE_MIN
        const pauseMax = random ? RAND_PAUSE_MAX : TURN_PAUSE_MAX

        // resume movement after delay
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(pauseMin, pauseMax),
            callback: () => {
                if (!this.sprite) return
                this.sprite.setVelocityX(oldVelocity)
                this.isPatrolPaused = false
            }
        })

        this.canPauseEvent?.remove()
        this.canPauseEvent = this.scene.time.addEvent({
            delay: Phaser.Math.Between(PAUSE_DELAY_MIN, PAUSE_DELAY_MAX),
            callback: () => this.canRandomPause = true
        })
    }
}
