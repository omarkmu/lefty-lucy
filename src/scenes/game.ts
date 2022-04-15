// Authors: Omar Muhammad

import Scene from '../components/scene'

// This should represent a single level of the game
export default class Game extends Scene {
    constructor() {
        super({
            name: 'game',
            background: 'bg',
            isCombatLevel: true,
            playerSpawn: [100, 525],
            enemies: Scene.generateEnemies([
                [500, 400],
                [1000, 525]
            ])
        })
    }

    preload() {
        super.preload()
        this.load.image('bg', 'assets/scrolltest.png')
    }
}
