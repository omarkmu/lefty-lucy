// Authors: Eric Burch

import Level from '../components/level'

const Story = [
    'Lucy has finally arrived to town.',
    'Lucy: I should search the town, see if I can find any information about the resistance.'
]

// This should represent a single level of the game
export default class Town extends Level {
    constructor() {
        super({
            name: 'town',
            background: 'town',
            backgroundMusic: 'home/town',
            nextLevel: "mountainpath",
            isCombatLevel: false,
            playerSpawn: [100, 525],
            npcs: [
                {
                    type: 'guerrilla',
                    spawn: [500, 525],
                    interactDialogue: [
                        'Resistance Member: Girl, I\'d stay away from me if I were you. I\'m someone you don\'t want to know.',
                        'Lucy: I know who you are. I\'m not afraid of you. I believe that you know of my Father. He was once a member of your organization.',
                        ['Resistance Member: Shhh!! Keep your voice down girl!', ' *The Resistance Member Nervously Glances Around*', ' Okay I\'ll tell you everything I know.'],
                        'Lucy: Thank you. You don\'t know how much this means to me.',
                        'Resistance Member: You won\'t be thanking me later. The path to the resistance is a tough one. Just follow me and keep quiet.',
                        '*Lucy follows the Resistance Member to the edge of town.*',
                        'Resistance Member: The Hideout is this way. If you follow this path to the mountain, you\'ll come across a cave. You\'ll find your answers there.'
                    ],
                    interactCallback: () => this.nextLevel()
                }
            ]
        })
    }
    create() {
        super.create()
        this.ui.dialogue.show(Story)
    }
}