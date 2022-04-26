// Authors: Eric Burch

import Level from '../components/level'

// This should represent a single level of the game
export default class Town extends Level {
    constructor() {
        super({
            name: 'town',
            background: 'town',
            nextLevel: "mountainpath",
            isCombatLevel: false,
            playerSpawn: [100, 525],
            winZone: [100, 525],
            groundColor: 0xb56d3d
        })
    }
}
