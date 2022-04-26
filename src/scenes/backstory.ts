// Authors: Eric Burch

import Level from '../components/level'

const backstory = [
    'Lucy is a normal teenager like any other.',
    'She lives in a world where the majority of the population is right-handed.',
    'The biggest difference between her and most others is that she is left-handed.',
    ['Left-handedness is illegal in her world.', ' The government, The Right, hunts down left-handed people mercilessly.'],
    'Her story begins when she finds the journal of her missing father. It turns out her father was a member of a mysterious rebel organization named The Left.',
    'Confused, Lucy decides to confront her mom to get more information.'
]

// This should represent a single level of the game
export default class Backstory extends Level {
    constructor() {
        super({
            name: 'backstory',
            background: 'backstory',
            backgroundMusic: 'home/town',
            nextLevel: "home",
            isCombatLevel: false,
            playerSpawn: [100, 525],
            loadPlayer: false
        })
    }
    create() {
        super.create()
        this.ui.dialogue.show(backstory, () => this.nextLevel())
    }
}
