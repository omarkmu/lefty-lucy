// Authors: Eric Burch

import Level from '../components/level'

// This should represent a single level of the game
export default class CavePath extends Level {
    constructor() {
        super({
            name: 'cavepath',
            background: 'cavepath',
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
