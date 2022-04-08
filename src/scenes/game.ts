// Base code from http://phaser.io/tutorials/making-your-first-phaser-3-game
// Authors: Omar Muhammad

import 'phaser'
import {
    CANVAS_WIDTH
} from '../constants'


const MAX_WIDTH = 1454
const SCROLL_PERCENT = 0.2
const MIN_SCROLL = -(MAX_WIDTH - CANVAS_WIDTH)
const SCROLL_DELTA = 3

const LEFT_SCROLL_BORDER = CANVAS_WIDTH * SCROLL_PERCENT
const RIGHT_SCROLL_BORDER = CANVAS_WIDTH - LEFT_SCROLL_BORDER


export default class Game extends Phaser.Scene {
    // TODO: improve
    // this implementation of firing is not very good & should change
    // just keeping it simple right now for the demo
    playerFacing = 1
    playerFiring = false

    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
    bg: Phaser.GameObjects.Image
    platforms: Phaser.Physics.Arcade.StaticGroup

    constructor() {
        super('game')
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys()

        // initialize background
        this.bg = this.add.image(0, 0, 'bg')
        this.bg.setOrigin(0, 0)

        // initialize platforms
        const platformDefs = [
            // ground platform
            {x: 0, y: 575, w: CANVAS_WIDTH, h: 1}
        ]

        this.platforms = this.physics.add.staticGroup()
        for (let i = 0; i < platformDefs.length; i++) {
            const info = platformDefs[i]
            const sprite = this.platforms.create(info.x, info.y, undefined, undefined, false)
            sprite.displayWidth = 1
            sprite.setOrigin(0, 0)
    
            sprite.enableBody()
            sprite.setSize(info.w, info.h, 0)
        }

        // TODO: player should be extracted to its own file
        // not how lucy will actually look, but fine for a mockup
        this.player = this.physics.add.sprite(100, 450, 'dude')
        this.player.setOrigin(0, 0)
        this.player.setBounce(0.2)
        this.player.setCollideWorldBounds(true)
    
        this.platforms.refresh()
        this.physics.add.collider(this.player, this.platforms)
    
        const animSprites = ['dude', 'antidude']
        for (const el of animSprites) {
            // initialize animations
            this.anims.create({
                key: `${el}_left`,
                frames: this.anims.generateFrameNumbers(el, { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            })
        
            this.anims.create({
                key: `${el}_turn`,
                frames: [ { key: el, frame: 4 } ],
                frameRate: 20
            })
        
            this.anims.create({
                key: `${el}_right`,
                frames: this.anims.generateFrameNumbers(el, { start: 5, end: 8 }),
                frameRate: 10,
                repeat: -1
            })
        }
    
        this.time.addEvent({
           loop: true,
           delay: 1000,
           callback:  () => {
                if (!this.playerFiring) return
    
                const fireball = this.physics.add.sprite(this.player.x, this.player.y, 'fireball')
                fireball.setOrigin(0, 0)
                //fireball.setCollideWorldBounds(true)
                //fireball.lifespan = 10
                fireball.setVelocityX(this.playerFacing * 200)
                fireball.setImmovable(false)
    
                fireball.body.setAllowGravity(false)
    
                this.time.addEvent({
                    delay: 5000,
                    callback: () => fireball.destroy()
                })
            }
        })
    }

    preload() {
        this.load.image('bg', 'assets/scrolltest.png')
        this.load.image('fireball', 'assets/fireball.png')
        this.load.spritesheet('dude', 'assets/dude.png', {
            frameWidth: 32,
            frameHeight: 48
        })
        this.load.spritesheet('antidude', 'assets/antidude.png', {
            frameWidth: 32,
            frameHeight: 48
        })
    }

    update() {
        if (this.cursors.left.isDown) {
            this.playerFacing = -1
            this.player.setVelocityX(-160)
            this.player.anims.play('dude_left', true)
    
            // handling it with a scroll border right now, but it should ultimately be a "region"
            // region implementation should help avoid player's choppiness while scrolling
            if (this.player.x <= LEFT_SCROLL_BORDER && this.bg.x < 0) {
                this.bg.x += SCROLL_DELTA
                this.player.x += SCROLL_DELTA
    
                if (this.bg.x > 0) this.bg.x = 0
            }
        } else if (this.cursors.right.isDown) {
            this.playerFacing = 1
            this.player.setVelocityX(160)
            this.player.anims.play('dude_right', true)
    
            if (this.player.x >= RIGHT_SCROLL_BORDER && this.bg.x > MIN_SCROLL) {
                this.bg.x -= SCROLL_DELTA
                this.player.x -= SCROLL_DELTA
            }
    
            if (this.bg.x < MIN_SCROLL) this.bg.x = MIN_SCROLL
        } else {
            this.player.setVelocityX(0)
            this.player.anims.play('dude_turn')
        }
    
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-300)
        }
    
        // for demo purposes
        this.playerFiring = this.cursors.space.isDown
    }
}
