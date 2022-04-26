// Authors: Eric Burch

import Level from '../components/level'
import ForestPath from './forestpath'

// This should represent a single level of the game
export default class Home extends Level {
    constructor() {
        super({
            name: 'home',
            background: 'home',
            nextLevel: "forestpath",
            isCombatLevel: false,
            playerSpawn: [100, 525],
            winZone: [100, 525],
        })
    }
}
