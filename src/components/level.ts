// Authors: Omar Muhammad
// Base code from http://phaser.io/tutorials/making-your-first-phaser-3-game

import { CANVAS_HEIGHT, EnemyDefinition } from '../constants'
import Enemy from './enemy'
import NPC, { NPCDefinition } from './npc'
import Player from './player'
import UI from './ui'


const ZONE_SIZE_DEFAULT = 32
const LEVEL_COMPLETE_DIALOGUE = [
    'Level complete. Press Enter to continue.'
]
const DIED_DIALOGUE = [
    'Oh no. You died. Press Enter to retry.'
]

const enum SceneState {
    Playing,
    PlayerWon,
    PlayerDied,
}


/**
 * Base class for game scenes.
 */
export default class Level extends Phaser.Scene {
    static generateEnemies(spawnLocations: [number, number][], enemyDef?: Omit<EnemyDefinition, 'spawn'>): EnemyDefinition[] {
        return spawnLocations.map(spawn => Object.assign({ spawn }, enemyDef ?? {}))
    }

    state: SceneState
    background: Phaser.GameObjects.Image
    platforms: Phaser.Physics.Arcade.StaticGroup
    playerProjectiles: Phaser.Physics.Arcade.Group
    npcGroup: Phaser.Physics.Arcade.Group
    enemyGroup: Phaser.Physics.Arcade.Group
    zoneGroup: Phaser.Physics.Arcade.StaticGroup
    zoneCallbacks: Record<string, () => void>
    player: Player
    enemies: Enemy[]
    npcs: NPC[]
    ui: UI
    music: any


    constructor(private _options: SceneOptions) {
        super(_options.name)
    }

    get isCombatLevel() {
        return this._options.isCombatLevel ?? false
    }


    create() {
        this.state = SceneState.Playing

        // initialize background
        this.background = this.add.image(0, 0, this._options.background)
        this.background.setOrigin(0)

        if (this.background.height < CANVAS_HEIGHT) {
            // Borrowed code from https://www.vishalon.net/blog/phaser3-stretch-background-image-to-cover-canvas
            this.background.displayWidth = this.sys.canvas.width;
            this.background.displayHeight = this.sys.canvas.height;
            this.background.width = this.sys.canvas.width;
            this.background.height = this.sys.canvas.height;
        }

        //music
        if (this._options.backgroundMusic) {
            this.music = this.sound.add(this._options.backgroundMusic, {
                volume: 0.25,
                loop: true

            })
            this.music.play()
        }

        // initialize camera and physics bounds
        this.cameras.main.setBounds(0, 0, this.background.width, this.background.height)
        this.physics.world.setBounds(0, 0, this.background.width, this.background.height)

        // initialize platforms
        // creates platform design for each level
        const defaultPlatformColor = this._options.platformDefaultColor ?? 0x000000
        this.platforms = this.physics.add.staticGroup()

        // ground platform
        const groundPos = this._options.groundY ?? 575
        const groundColor = this._options.groundColor ?? defaultPlatformColor
        const groundHeight = this._options.groundSize ?? 50
        this.addPlatform(0, groundPos, this.background.width, groundHeight, groundColor)
            .setOrigin(0)

        if (this._options.platforms) {
            for (const arr of this._options.platforms) {
                const w = arr[2] ?? 80 // default width
                const h = arr[3] ?? 18 // default height
                const color = arr[4] ?? defaultPlatformColor
                this.addPlatform(arr[0], arr[1], w, h, color)
            }
        }

        // initialize zones
        this.zoneGroup = this.physics.add.staticGroup()
        this.zoneCallbacks = {}

        if (this._options.winZone) {
            this.createZone('win', this._options.winZone, this.onPlayerWon.bind(this))
        }

        this.enemyGroup = this.physics.add.group()
        this.npcGroup = this.physics.add.group()
        this.playerProjectiles = this.physics.add.group()

        // initialize npcs
        this.npcs = (this._options.npcs ?? []).map(def => new NPC(this, def))
        this.physics.add.collider(this.npcGroup, this.platforms)

        // initialize enemies
        this.enemies = (this._options.enemies ?? []).map(def => new Enemy(this, def))

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
        this.player = new Player(this, {
            spawn: {
                x: this._options.playerSpawn?.[0] ?? 0,
                y: this._options.playerSpawn?.[1] ?? 0,
            },
            isFireballEnabled: this._options.playerFireballEnabled ?? false,
            isSwordEnabled: this._options.playerSwordEnabled ?? false,
            visible: this._options.loadPlayer !== false
        })

        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08)

        this.physics.add.collider(this.player.sprite, this.platforms)
        this.physics.add.overlap(this.player.sprite, this.zoneGroup, (_, zone: any) => {
            this.zoneCallbacks[zone.zoneID]?.()
        })

        this.platforms.refresh()
        this.zoneGroup.refresh()

        // initialize UI
        this.ui = new UI(this)

        // resume animations, if paused
        this.anims.resumeAll()
    }

    update() {
        if (this.state === SceneState.PlayerWon || this.state === SceneState.PlayerDied) {
            this.ui.handleInput(this.player.keys)
            return
        }

        for (const enemy of this.enemies) {
            if (enemy.isDead) continue
            enemy.update()
        }

        for (const npc of this.npcs) {
            npc.update()
        }

        this.player.update()
    }

    createZone(id: string, zone: Zone, cb?: () => void) {
        const w = zone[2] ?? ZONE_SIZE_DEFAULT
        const h = zone[3] ?? w

        const sprite = this.zoneGroup.create(zone[0], zone[1], undefined, undefined, false)
        sprite.setSize(w, h, 0)
        sprite.zoneID = id

        if (cb) this.zoneCallbacks[id] = cb
    }

    freezeEntities() {
        // freeze enemies, player, and projectiles
        for (const enemy of this.enemies) {
            if (enemy.isDead) continue
            enemy.sprite.disableBody()
        }

        this.playerProjectiles.setVelocity(0, 0)
        this.player.sprite.disableBody()
        this.anims.pauseAll()
    }

    onPlayerWon() {
        this.state = SceneState.PlayerWon
        this.freezeEntities()
        this.ui.dialogue.show(LEVEL_COMPLETE_DIALOGUE, this.nextLevel.bind(this))
    }

    onPlayerDied() {
        this.state = SceneState.PlayerDied
        this.freezeEntities()
        this.ui.dialogue.show(DIED_DIALOGUE, this.resetLevel.bind(this))
    }

    nextLevel() {
        this.music?.pause()
        this.scene.start(this._options.nextLevel ?? 'main-menu')
    }

    resetLevel() {
        this.scene.start(this._options.name)
    }

    addPlatform(x: number, y: number, width: number, height: number, color: number) {
        const rect = this.add.rectangle(x, y, width, height, color)
        this.platforms.add(rect)

        return rect
    }
}


type Zone = [number, number, number?, number?]

interface SceneOptions {
    /**
     * The unique name of the scene.
     */
    name: string
    /**
     * The key (provided to load.image) of the background image for this scene.
     */
    background: string
    /**
     * The key (provided to load.audio) of the background music for this scene.
     */
    backgroundMusic?: string
    /**
     * The name of the next level to load after this level is completed.
     * Returns to the main menu if no next level is specified.
     */
    nextLevel?: string
    /**
     * Defines whether this is a combat or story level.
     */
    isCombatLevel?: boolean
    /**
     * Set to false to not load the player.
     */
    loadPlayer?: false
    /**
     * The spawn location of the player. Specified as [X, Y].
     */
    playerSpawn?: [number, number]
    /**
     * Platforms. Specified as [X, Y], [X, Y, WH], or [X, Y, W, H, Color].
     */
    platforms?: number[][]
    /**
     * Color of the ground platform.
     */
    groundColor?: number
    /**
     * Position of the ground platform.
     * Defaults to 575.
     */
    groundY?: number
    /**
     * Size of the ground platform.
     * Defaults to 575.
     */
    groundSize?: number
    /**
     * Platform color default, for when a platform color isn't specified.
     * Defaults to black.
     */
    platformDefaultColor?: number
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
     * NPC definitions
     */
    npcs?: NPCDefinition[]
    /**
     * A zone that describes the target area the player must enter to pass the level.
     * Specified as [X, Y] for default width/height, [X, Y, W] for height = W,
     * or as [X, Y, W, H].
     */
    winZone?: Zone
}
