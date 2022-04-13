// Authors: Omar Muhammad

import 'phaser'
import Player from './player'


/**
 * Base class for game scenes.
 */
 export default class Scene extends Phaser.Scene {
    background: Phaser.GameObjects.Image
    platforms: Phaser.Physics.Arcade.StaticGroup
    player: Player

    constructor(private _options: SceneOptions) {
        const opts = _options as any
        super(opts.config ?? opts.name)
    }

    create() {
        // initialize background
        this.background = this.add.image(0, 0, this._options.background)
        this.background.setOrigin(0, 0)

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
            sprite.setOrigin(0, 0)
    
            sprite.enableBody()
            sprite.setSize(info.w, info.h, 0)
        }

        // initialize player
        this.player = new Player(this)
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08)

        this.physics.add.collider(this.player.sprite, this.platforms)
        this.platforms.refresh()
    }

    update() {
        this.player.update()
    }
}


type HasConfig = {
    /**
     * The scene settings configuration.
     * We probably won't need this, just including it in case we do.
     */
    config: Phaser.Types.Scenes.SettingsConfig
}
type HasName = {
    /**
     * The unique name of the scene.
     */
    name: string
}

type SceneOptions = (HasName | HasConfig) & {
    /**
     * The key (provided to load.image) of the background image for this scene.
     */
    background: string,
    /**
     * Defines whether this is a combat or story level.
     * Unused for now.
     */
    isCombatLevel?: boolean
}
