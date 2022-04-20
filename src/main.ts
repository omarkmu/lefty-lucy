// Authors: Omar Muhammad

import 'phaser'
import Game from './scenes/game'
import LoadingScene from './scenes/loading'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants'

new Phaser.Game({
    type: Phaser.AUTO,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    scene: [
        LoadingScene,
        Game,
    ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 200 }
        }
    },
})
