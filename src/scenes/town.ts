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
            groundColor: 0xb56d3d,
            npcs: [
                {
                    type: 'rebel',
                    spawn: [700, 525],
                    interactDistance: 25,
                    interactDialogue: [
                        'Resistance Member: Girl, I\'d stay away from me if I were you. I\'m someone you don\'t want to know.',
                        'Lucy: I know who you are. I\'m not afraid of you. I believe that you know of my Father. He was once a member of your organization.',
                        ['Resistance Member: Shhh!! Keep your voice down girl!', ' *The Resistance Member Nervously Glances Around*', ' Okay I\'ll tell you everything I know.'],
                        'Lucy: Thank you. You don\'t know how much this means to me.',
                        'Resistance Member: You won\'t be thanking me later. The path to the resistance is a tough one. Just follow me and keep quiet.',
                        '*Lucy follows the Resistance Member to the edge of town.*',
                        'Resistance Member: Before you leave, I should tell you of your powers. Have you ever noticed that you have strange occurrences around you? These are your left-handed powers.',
                        'Lucy: Now that you mention it, I have...',
                        'Resistance Member: If you concentrate hard enough, you\'ll be able to control them. Concentrate the power in your palm and shoot it out.',
                        ['Lucy: Okay...', ' *Lucy does as the man describes, she is surprised to see a glow coming from her palm. A ball of fire then emerges from her hand.*'],
                        'Resistance Member: Good, you do have the power. It\'s time for you to go now.',
                        'Resistance Member: The Hideout is this way. If you follow this path to the mountain, you\'ll come across a cave. You\'ll find your answers there.'
                    ],
                    interactCallback: () => this.nextLevel()
                },
                {
                    type: 'civilian',
                    spawn: [200, 525],
                    interactDistance: 25,
                    interactDialogue: [
                        'Townsfolk: Hello there! How\'re you?',
                        'Lucy: Hello, I\'m good, thanks.'
                    ]
                },
                {
                    type: 'civilianblue',
                    spawn: [350, 525],
                    interactDistance: 25,
                    interactDialogue: [
                        'Townsfolk: Hello there! Wonderful weather we\'re having.',
                        'Lucy: Hello, it is isn\'t it.'
                    ]
                },
                {
                    type: 'civilianpurple',
                    spawn: [500, 525],
                    interactDistance: 25,
                    interactDialogue: [
                        'Townsfolk: Hello there! Looking for anything?',
                        'Lucy: Hello. I\'m just looking around. Thanks.'
                    ]
                },
                {
                    type: 'civiliangreen',
                    spawn: [600, 525],
                    interactDistance: 25,
                    interactDialogue: [
                        'Townsfolk: What is it? Someone stole your sweet roll?',
                        'Lucy: What? No, I\'m just looking around.'
                    ]
                }
            ]
        })
    }

    create() {
        super.create()
        this.ui.dialogue.show(Story)
    }
}
