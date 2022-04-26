// Authors: Eric Burch

import Level from '../components/level'

// This should represent a single level of the game
export default class Home extends Level {
    constructor() {
        super({
            name: 'home',
            background: 'home',
            backgroundMusic: 'home/town',
            nextLevel: "forestpath",
            isCombatLevel: false,
            playerSpawn: [100, 525],
            groundY: 540,
            groundSize: 65,
            groundColor: 0x865322,
            npcs: [
                {
                    type: 'mom',
                    spawn: [150, 525],
                    interactDialogue: [
                        'Mom: Lucy, it\'s not what you think.',
                        'Lucy: I found the notebook Mom. I know Dad was a member of The Left.',
                        'Mom: Don\'t speak of him that way Lucy. You know The Left is just a myth.',
                        ['Lucy: Mom... ', ' I found the notebook in your room. Why would you keep it if it wasn\'t important?'],
                        ['Mom: You\'re right Lucy... ', 'I never knew how to tell you. Your Father was a member of the Resistance but then he went missing.'],
                        'Lucy: I\'m going to find Dad. You can\'t stop me.',
                        '(Lucy leaves home in search of her Father. She decides to check the town nearby for any leads.)'
                    ],
                    interactCallback: () => this.nextLevel()
                }
            ]
        })
    }
}
