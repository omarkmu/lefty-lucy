// Authors: Eric Burch

import Level from '../components/level'
import Cave from './cave'

// This should represent a single level of the game
export default class MountainPath extends Level {
    constructor() {
        super({
            name: 'mountainpath',
            background: 'mountainpath',
            backgroundMusic: 'lvl2',
            nextLevel: "cave",
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
