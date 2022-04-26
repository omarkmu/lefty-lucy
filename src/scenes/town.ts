// Authors: Eric Burch

import Level from '../components/level'

// This should represent a single level of the game
export default class Town extends Level {
    constructor() {
        super({
            name: 'town',
            background: 'town',
            isCombatLevel: false,
            playerSpawn: [100, 525],
            winZone: [800, 490],
        })
    }
}