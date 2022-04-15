// Authors: Omar Muhammad
// Base code from http://phaser.io/tutorials/making-your-first-phaser-3-game

import { EnemyDefinition } from '../constants'
import Enemy from './enemy'
import Player from './player'
import UI from './ui'


/**
 * Base class for game scenes.
 */
 export default class Scene extends Phaser.Scene {
    static generateEnemies(spawnLocations: [number, number][], enemyDef?: Omit<EnemyDefinition, 'spawn'>): EnemyDefinition[] {
        return spawnLocations.map(spawn => Object.assign({ spawn }, enemyDef ?? {}))
    }

    background: Phaser.GameObjects.Image
    platforms: Phaser.Physics.Arcade.StaticGroup
    playerProjectiles: Phaser.Physics.Arcade.Group
    enemyGroup: Phaser.Physics.Arcade.Group
    player: Player
    enemies: Enemy[]
    ui: UI

    constructor(private _options: SceneOptions) {
        super((_options as any).config ?? _options.name)

        this.player = new Player(this, {
            x: this._options.playerSpawn[0],
            y: this._options.playerSpawn[1]
        })

        this.enemies = (_options.enemies ?? []).map(def => new Enemy(this, def))
        this.ui = new UI(this)
    }

    get isCombatLevel() {
        return this._options.isCombatLevel ?? false
    }

    preload() {
        this.player.preload()
        Enemy.preload(this) // only need to preload enemy assets once
        this.ui.preload()
    }

    create() {
        // initialize background
        this.background = this.add.image(0, 0, this._options.background)
        this.background.setOrigin(0)

        // initialize camera and physics bounds
        this.cameras.main.setBounds(0, 0, this.background.width, this.background.height)
        this.physics.world.setBounds(0, 0, this.background.width, this.background.height)

        // initialize platforms
        // TODO: platforms should be supplied via the options,
        // specified as an array of objects (or otherwise) for code reusability.
        // keeping it as is for now since the platform creation code may be improved soon
        this.platforms = this.physics.add.staticGroup()

        const platformDefs = [{ x: 0, y: 575, w: this.background.width, h: 1 }]
        for (let i = 0; i < platformDefs.length; i++) {
            const info = platformDefs[i]
            const sprite = this.platforms.create(info.x, info.y, undefined, undefined, false)
            sprite.displayWidth = 1
            sprite.setOrigin(0)

            sprite.enableBody()
            sprite.setSize(info.w, info.h, 0)
        }

        this.enemyGroup = this.physics.add.group()
        this.playerProjectiles = this.physics.add.group()

        // initialize enemies
        for (const enemy of this.enemies) {
            enemy.create()
        }

        this.physics.add.collider(this.enemyGroup, this.platforms, (enemy, platform) => {
            const owner = (enemy as any).owner
            owner.currentPlatform = platform
        })

        this.physics.add.overlap(this.enemyGroup, this.playerProjectiles, (enemy, projectile) => {
            const owner = (enemy as any).owner
            if (!owner || owner.isDead) return

            owner.applyDamage((projectile as any).damage)
            projectile.destroy()
        })

        // initialize player
        this.player.create()
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08)

        this.physics.add.collider(this.player.sprite, this.platforms)
        this.platforms.refresh()

        // initialize UI
        this.ui.create()
    }

    update() {
        for (const enemy of this.enemies) {
            if (enemy.isDead) continue
            enemy.update()
        }

        this.player.update()
    }
}


interface SceneOptions {
    /**
     * The key (provided to load.image) of the background image for this scene.
     */
    background: string
    /**
     * Defines whether this is a combat or story level.
     */
    isCombatLevel?: boolean
    /**
     * The unique name of the scene.
     */
    name: string
    /**
     * The spawn location of the player. Specified as [X, Y].
     */
    playerSpawn: [number, number]
    /**
     * Information about enemies which should be spawned.
     */
    enemies?: EnemyDefinition[]
}
