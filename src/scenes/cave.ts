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
            groundColor: 0x844e35,
            playerSpawn: [100, 543],
            npcs: [
                {
                    type: 'rebelleader',
                    spawn: [700, 543],
                    interactDistance: 25,
                    interactDialogue: [
                        'Resistance Leader: Hello there. You must be Lucy. Our friend has already filled me in.',
                        'Lucy: Do you know where my Father is?? Tell me anything you know!',
                        ['Resistance Leader: I\'ll tell you, but you won\'t like the answer.', ' Your father has been captured by the Right.'],
                        'Lucy: Oh no... This can\'t be happening.',
                        'Resistance Leader: I do have a small amount of good news though.',
                        'Lucy: What is it?',
                        'Resistance Leader: Your father is close, the leader of The Right has been holding him prisoner very closely.',
                        '* A shout suddenly comes from the edge of the cave*',
                        'Resistance Member: *screaming* The Right is atatcking! Their leader blew a whole in the mountain and is advancing from deeper in the cave!! We need help!',
                        'Resistance Leader: I know this is unfair, but we need your help. Take this sword and go. You have to stop them!'
                    ],
                    interactCallback: () => this.nextLevel()
                },
                {
                    type: 'rebel',
                    spawn: [200, 543],
                    interactDistance: 25,
                    interactDialogue: [
                        'Rebel: Hello. You must be his daughter. You look like him.',
                        'Lucy: Thank you.'
                    ]
                },
                {
                    type: 'rebel',
                    spawn: [350, 543],
                    interactDistance: 25,
                    interactDialogue: [
                        'Rebel: The Right will never find us here. We\'re hidden here.',
                        'Lucy: Yes, this is definitely out of the way.'
                    ]
                },
                {
                    type: 'rebel',
                    spawn: [500, 543],
                    interactDistance: 25,
                    interactDialogue: [
                        'Rebel: You must be the new girl? Younger than I imagined.',
                        'Lucy: I can still fight.'
                    ]
                },
            ]
        })
    }
}