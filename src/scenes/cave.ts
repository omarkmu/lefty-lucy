// Authors: Eric Burch

import Level from '../components/level'

// This should represent a single level of the game
export default class Cave extends Level {
    constructor() {
        super({
            name: 'cave',
            background: 'cave',
            backgroundMusic: 'lvl3',
            nextLevel: "cavepath",
            isCombatLevel: false,
            playerSpawn: [100, 525],
            winZone: [100, 525],
        })
    }
}