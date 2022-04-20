// Base code from http://phaser.io/tutorials/making-your-first-phaser-3-game
// Camera code from https://github.com/photonstorm/phaser3-examples/blob/master/public/src/camera/follow%20zoom%20tilemap.js
// Authors: Omar Muhammad

import Scene from '../components/scene'

// This should represent a single level of the game
export default class Game extends Scene {
    constructor() {
        super({
            name: 'game',
            background: 'bg',
            isCombatLevel: true
        })
    }

    preload() {
        super.preload()
        
    }
   
}
