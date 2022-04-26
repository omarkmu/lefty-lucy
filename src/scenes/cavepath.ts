// Authors: Eric Burch

import Level from '../components/level'

const level_3 = [[700, 525], [238, 341], [36, 424], [210, 486], [142, 324], [387, 404], [421, 280], [61, 203], [250, 118], [587, 463], [654, 310], [766, 152], [513, 120], [901, 272], [1115, 382]]
const Backstory1 = [
    'Resistance Leader: You did it! You defeated Righty Tighty!',
    ['Lucy: I did..', ' I can\'t believe it.'],
    'Resistance Leader: I believe there\'s someone who wants to see you now.',
    'Lucy: Oh right! Dad!',
    'Dad: I\'m so proud of you Lucy. We can finally live without fear. Let\'s go home.',
    'They then lived happily ever after.',
    'The End'
]


// This should represent a single level of the game
export default class CavePath extends Level {
    constructor() {
        super({
            name: 'cavepath',
            background: 'cavepath',
            backgroundMusic: 'lvl3',
            nextLevel: 'victory',
            isCombatLevel: true,
            playerSpawn: [100, 550],
            platformDefaultColor: 0x111111,
            groundColor: 0xb13e53,
            playerFireballEnabled: true,
            playerSwordEnabled: true,
            enemies: [{
                type: 'boss',
                spawn: [600, 550]
            }],
            platforms: [
                ...level_3,
            ]
        })
    }

    update() {
        super.update()
        // check for boss defeat
        if (this.enemies[0]?.isDead) {
            this.ui.dialogue.show(Backstory1, () => this.nextLevel())
        }
    }
}
