// Authors: Eric Burch

import Level from '../components/level'

// This should represent a single level of the game
export default class Home extends Level {
    constructor() {
        super({
            name: 'home',
            background: 'home',
            nextLevel: "forestpath",
            isCombatLevel: false,
            playerSpawn: [100, 525],
            npcs: [
                {
                    type: 'mom',
                    spawn: [150, 525],
                    interactDialogue: [
                        'Mom: lucy its not what you think',
                        'Lucy: i found the notebook mom. i know dad was a gamer',
                        'Mom: dont speak of him that way lucy. you know that being a gamer is banned in our society',
                        ['Lucy: mom...', ' im a gamer'],
                    ],
                    interactCallback: () => this.nextLevel()
                }
            ]
        })
    }
}
