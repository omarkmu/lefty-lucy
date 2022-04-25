// Authors: Omar Muhammad

import 'phaser'
import { level_1, level_2, level_3} from '../constants'
import { level_1_s, level_2_s, level_3_s } from '../constants'
import Player from './player'
import UI from './ui'


/**
 * Base class for game scenes.
 */
 export default class Scene extends Phaser.Scene {
    background: Phaser.GameObjects.Image
    platforms: Phaser.Physics.Arcade.StaticGroup
    player: Player
    ui: UI
    

    constructor(private _options: SceneOptions) {
       
        //const opts = _options as any
        super((_options as any).name)
        
       // this.level_platforms = test_platform
       this.ui = new UI(this) 
       this.player = new Player(this)
        
    }

    get isCombatLevel() {
        return this._options.isCombatLevel ?? false
    }

    preload() {
        this.player.preload()
        this.ui.preload()
        this.load.image('platform', 'assets/5.png');
        this.load.image('sideways', 'assets/sideways.png');

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

       

      //creates platform design for each level
      //takes a string thats located in constants.ts
      
      const platforms = this.physics.add.staticGroup()
    for (let i = 0; i < level_2.length; i++) {
        const [x, y] = level_2[i]
        platforms.create(x, y, 'platform')
    }
    for (let i = 0; i < level_2_s.length; i++) {
        const [x, y] = level_2_s[i]
        platforms.create(x, y, 'sideways')
    }

        // initialize player
        this.player.create()
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08)

        this.physics.add.collider(this.player.sprite, this.platforms);
      
        this.platforms.refresh()
       

        // initialize UI
        this.ui.create()

    
    }

    update() {
        this.player.update()
    }
}



interface SceneOptions {
    /**
     * The key (provided to load.image) of the background image for this scene.
     */
     background: string,
     /**
      * Defines whether this is a combat or story level.
      * Unused for now.
      */
     isCombatLevel?: boolean,
     /**
     * The unique name of the scene.
     */
    name: string
}
