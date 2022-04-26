// Authors: Eric Burch

import Level from '../components/level'

// This should represent a single level of the game
export default class CavePath extends Level {
    constructor() {
        super({
            name: 'cavepath',
            background: 'cavepath',
            backgroundMusic: 'lvl3',
            nextLevel: 'victory',
            isCombatLevel: true,
            playerSpawn: [100, 525],
            winZone: [100, 525],
            enemies: Level.generateEnemies([
                [500, 400],
                [1000, 525]
            ])
        })
    }
}
