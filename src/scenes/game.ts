// Authors: Omar Muhammad

import Level from '../components/level'

// This should represent a single level of the game
export default class Game extends Level {
    constructor() {
        super({
            name: 'game',
            background: 'bg',
            isCombatLevel: true,
            playerSpawn: [100, 525],
            winZone: [800, 490],
            enemies: Level.generateEnemies([
                [500, 400],
                [1000, 525]
            ])
        })
    }
}
