// Authors: Eric Burch

import Level from '../components/level'

const level_3 = [[700, 525], [238, 341], [36, 424], [210, 486], [142, 324], [387, 404], [421, 280], [61, 203], [250, 118], [587, 463], [654, 310], [766, 152], [513, 120], [901, 272], [1115, 382]]


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
            platformDefaultColor: 0x111111,
            groundColor: 0xb13e53,
            playerFireballEnabled: true,
            playerSwordEnabled: true,
            enemies: Level.generateEnemies([
                [500, 400],
                [1000, 525]
            ]),
            platforms: [
                ...level_3,
            ]
        })
    }
}
