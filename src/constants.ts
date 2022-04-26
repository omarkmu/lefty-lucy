// Authors: Omar Muhammad

export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 600

export const enum Direction {
    Left = -1,
    Right = 1
}

export interface Keys extends Omit<Phaser.Types.Input.Keyboard.CursorKeys, 'shift'> {
    interact: Phaser.Input.Keyboard.Key
    enter: Phaser.Input.Keyboard.Key
}

export interface EnemyDefinition {
    /**
     * Enemy type.
     * Default: 'enemy' for normal enemy.
     */
    type?: 'enemy' | 'boss'
    /**
     * The [X, Y] location of the enemy spawn.
     */
    spawn: [number, number]
    initialDirection?: Direction
    attackRange?: number
    attackDamage?: number
    attackDelay?: number
    health?: number
    hearingRange?: number
    visionRange?: number
    /**
     * Set to disable patrol behavior.
     */
    disablePatrol?: true
    /**
     * A minimum and maximum X value to patrol.
     * If excluded, the enemy will patrol the entirety of whatever platform it's standing on.
     */
    patrolRange?: [number, number]
}

export interface SpawnLocation {
    x: number
    y: number
}
