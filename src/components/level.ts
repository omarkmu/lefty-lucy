// Authors: Omar Muhammad
// Base code from http://phaser.io/tutorials/making-your-first-phaser-3-game

import { CANVAS_HEIGHT, EnemyDefinition } from '../constants'
import { level_1, level_2, level_3 } from '../constants'
import { level_1_s, level_2_s, level_3_s } from '../constants'
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
                volume: 0.5,
                loop: true

            })
            this.music.play()
        }

        // initialize camera and physics bounds
        this.cameras.main.setBounds(0, 0, this.background.width, this.background.height)
        this.physics.world.setBounds(0, 0, this.background.width, this.background.height)

        // initialize platforms
        // TODO: platforms should be supplied via the options,
        // specified as an array of objects (or otherwise) for code reusability.
        // keeping it as is for now since the platform creation code may be improved soon
        // creates platform design for each level
        // takes a string thats located in constants.ts
        this.platforms = this.physics.add.staticGroup()

        this.addPlatform(0, 575, this.background.width, 1) // ground platform
        /*for (let i = 0; i < level_1.length; i++) {
            const [x, y] = level_1[i]
            this.addPlatform(x * 2, y * 2, 278, 46, 'platform')
        }
        for (let i = 0; i < level_1_s.length; i++) {
            const [x, y] = level_1_s[i]
            this.addPlatform(x * 2, y * 2, 15, 70, 'sideways')
        }
*/
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
        console.log(this._options.name, this._options.nextLevel)
    }

    resetLevel() {
        this.scene.start(this._options.name)
    }

    addPlatform(x: number, y: number, width: number, height: number, img?: string) {
        const sprite = this.platforms.create(
            x, y,
            img ?? undefined, undefined,
            img !== undefined)

        sprite.enableBody()
        if (img === undefined) {
            sprite.setSize(width, height, 0)
        }
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
