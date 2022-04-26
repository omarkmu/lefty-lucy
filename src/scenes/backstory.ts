// Authors: Eric Burch

import Level from '../components/level'

const Backstory1 = [
    'Lucy is a normal teenager like any other.',
    'She lives in a world where the majority of the population is mostly right handed.',
    'The biggest difference between her and most others is that she is left handed.',
    ['Left-handedness is illegal in her world.', 'The government, The Right, hunts left handed people down mercilessly.'],
    'Her story begins when she finds a journal about her missing father. Determined to find him, she confronts her mother about it.'
]

// This should represent a single level of the game
export default class Backstory extends Level {
    constructor() {
        super({
            name: 'backstory',
            background: 'backstory',
            nextLevel: "home",
            isCombatLevel: false,
            playerSpawn: [100, 525],
        })
    }
    create() {
        super.create()
        this.ui.dialogue.show(Backstory1, () => this.nextLevel())
    }
}
