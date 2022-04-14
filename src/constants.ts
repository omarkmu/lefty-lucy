// Authors: Omar Muhammad

export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 600

export interface Keys extends Omit<Phaser.Types.Input.Keyboard.CursorKeys, 'shift'> {
    interact: Phaser.Input.Keyboard.Key
    enter: Phaser.Input.Keyboard.Key
}
