// Authors: Omar Muhammad

import { Direction, EnemyDefinition, SpawnLocation } from '../constants'
import Scene from './scene'

const VELOCITY = 150

const TURN_PAUSE_MIN = 600
const TURN_PAUSE_MAX = 1000

const RAND_PAUSE_MIN = 1000
const RAND_PAUSE_MAX = 3000
const RAND_PAUSE_DELAY = 10000
const RAND_PAUSE_CHANCE = 0.25

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
    playerDistance: number
    isTargetingPlayer: boolean = false
    initialDirection: Direction
    currentPlatform: Phaser.Types.Physics.Arcade.GameObjectWithBody

    isPatrolEnabled: boolean
    isPatrolPaused: boolean = false
    lastRandomPause: number = 0
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
        this.visionRange = def.visionRange ?? 400
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

        if (this.isPatrolEnabled) {
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

    patrol() {
        if (this.isPatrolPaused) return

        // determine if the enemy should pause movement
        const now = this.scene.time.now
        const checkSuccess = Phaser.Math.FloatBetween(0, 1) <= RAND_PAUSE_CHANCE
        const canPause = this.lastRandomPause < now - RAND_PAUSE_DELAY
        if (checkSuccess && canPause) {
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
                this.sprite.setVelocityX(oldVelocity)

                if (random) {
                    this.lastRandomPause = this.scene.time.now
                }

                this.isPatrolPaused = false
            }
        })
    }
}
