// Authors: Omar Muhammad
// Base code from http://phaser.io/tutorials/making-your-first-phaser-3-game

import { EnemyDefinition } from '../constants'
import Enemy from './enemy'
import Player from './player'
import UI from './ui'


const ZONE_SIZE_DEFAULT = 100


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
    zoneGroup: Phaser.Physics.Arcade.StaticGroup
    zoneCallbacks: Record<string, () => void> = {}
    player: Player
    enemies: Enemy[]
    ui: UI

    constructor(private _options: SceneOptions) {
        super((_options as any).config ?? _options.name)

        this.player = new Player(this, {
            spawn: {
                x: this._options.playerSpawn[0],
                y: this._options.playerSpawn[1],
            },
            isFireballEnabled: _options.playerFireballEnabled ?? false,
            isSwordEnabled: _options.playerSwordEnabled ?? false,
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

        // initialize zones
        this.zoneGroup = this.physics.add.staticGroup()

        if (this._options.winZone) {
            this.createZone('win', this._options.winZone, () => {
                // TODO: handle win here
            })
        }

        this.enemyGroup = this.physics.add.group()
        this.playerProjectiles = this.physics.add.group()

        // initialize enemies
        for (const enemy of this.enemies) {
            enemy.create()
        }

        this.physics.add.collider(this.enemyGroup, this.platforms, (enemySprite, platform) => {
            const enemy = (enemySprite as any).owner
            enemy.currentPlatform = platform
        })

        this.physics.add.overlap(this.enemyGroup, this.playerProjectiles, (enemySprite, projectile) => {
            const enemy = (enemySprite as any).owner
            if (!enemy || enemy.isDead) return

            enemy.applyDamage((projectile as any).damage)
            projectile.destroy()
        })

        // initialize player
        this.player.create()
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08)

        this.physics.add.collider(this.player.sprite, this.platforms)
        this.physics.add.overlap(this.player.sprite, this.zoneGroup, (_, zoneSprite) => {
            const zone = zoneSprite as any
            this.zoneCallbacks[zone.zoneID]?.()
        })

        this.platforms.refresh()
        this.zoneGroup.refresh()

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

    createZone(id: string, zone: Zone, cb: () => void) {
        const w = zone[2] ?? ZONE_SIZE_DEFAULT
        const h = zone[3] ?? w
        const sprite = this.zoneGroup.create(zone[0], zone[1], undefined, undefined, false)
        sprite.setSize(w, h, 0)

        sprite.zoneID = id
        this.zoneCallbacks[id] = cb
    }
}


type Zone =
    | [number, number]
    | [number, number, number]
    | [number, number, number, number]

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
     * Whether the fireball attack is enabled in this level.
     * Default: false.
     */
    playerFireballEnabled?: boolean
    /**
     * Whether the punch attack in this level should be replaced with a sword attack.
     * Default: false.
     */
    playerSwordEnabled?: boolean
    /**
     * Information about enemies which should be spawned.
     */
    enemies?: EnemyDefinition[]
    /**
     * A zone that describes the target area the player must enter to pass the level.
     * Specified as [X, Y] for default width/height, [X, Y, W] for height = W,
     * or as [X, Y, W, H].
     */
    winZone?: Zone
}
