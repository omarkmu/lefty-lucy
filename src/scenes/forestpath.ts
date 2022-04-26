// Authors: Eric Burch

import Level from '../components/level'

// This should represent a single level of the game
export default class ForestPath extends Level {
    constructor() {
        super({
            name: 'forestpath',
            background: 'forestpath',
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
