// Authors: Omar Muhammad / Eric Burch

import 'phaser'

import Home from './scenes/home'
import ForestPath from './scenes/forestpath'
import Town from './scenes/town'
import MountainPath from './scenes/mountainpath'
import Cave from './scenes/cave'
import CavePath from './scenes/cavepath'

import LoadingScreen from './scenes/loading'
import MainMenuScene from './scenes/menu'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants'

new Phaser.Game({
    type: Phaser.AUTO,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    scene: [
        LoadingScreen,
        MainMenuScene,
        Home,
        ForestPath,
        Town,
        MountainPath,
        Cave,
        CavePath
    ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 325 }
        }
    },
})
