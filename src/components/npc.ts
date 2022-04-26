import { SpawnLocation } from '../constants'
import Level from './level'

const DEFAULT_INTERACT_DISTANCE = 100
const INTERACT_TEXT = 'Press E to talk'

export default class NPC {
    playerDistance: number
    interactDistance: number
    playerCanInteract: boolean
    hasInteraction: boolean
    text: Phaser.GameObjects.Text

    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    spawn: SpawnLocation

    constructor(public scene: Level, private _options: NPCDefinition) {
        this.spawn = {
            x: this._options.spawn[0],
            y: this._options.spawn[1],
        }

        this.playerCanInteract = false
        this.hasInteraction = this._options.interactDialogue !== undefined
        this.interactDistance = this._options.interactDistance ?? DEFAULT_INTERACT_DISTANCE

        this.create()
    }

    startInteraction() {
        if (!this.hasInteraction) return
        this.scene.ui.dialogue.show(this._options.interactDialogue, this._options.interactCallback)
    }

    create() {
        this.sprite = this.scene.npcGroup.create(this.spawn.x, this.spawn.y, `${this._options.type}_stand`)
            .setCollideWorldBounds(true)      
        this.text = this.scene.make.text({
            x: this.spawn.x,
            y: this.spawn.y - this.sprite.height / 2,
            text: INTERACT_TEXT,
            visible: false,
            origin: 0.5
        })
    }

    update() {
        this.playerDistance = Phaser.Math.Distance.BetweenPoints(this.sprite, this.scene.player.sprite)
        this.playerCanInteract = this.hasInteraction && this.playerDistance <= this.interactDistance
        this.text.visible = this.playerCanInteract
    }
}


type NPCType = 'mom' | 'civilian' | 'guerrilla'

export interface NPCDefinition {
    type: NPCType
    spawn: [number, number]
    interactDistance?: number
    interactDialogue?: (string | string[])[]
    interactCallback?: () => void
}
