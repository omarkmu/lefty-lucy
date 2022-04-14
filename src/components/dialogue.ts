// Authors: Omar Muhammad

import DialogueBox from './dialogueBox'
import type UI from './ui'

export default class DialogueManager {
    dialogueBox: DialogueBox
    currentIndex: number
    lines: [string, number][] = []

    constructor(public ui: UI) {
        this.dialogueBox = new DialogueBox(ui)
    }

    get visible() { return this.dialogueBox.visible }

    create() {
        this.dialogueBox.create()
    }

    show(lines?: (string | string[])[]) {
        if (!lines) {
            this.dialogueBox.show()
            return
        }

        if (lines.length === 0) {
            return
        }

        const processedLines: [string, number][] = []
        for (const info of lines) {
            if (typeof info === 'string') {
                processedLines.push([info, 0])
                continue
            }

            if (info.length === 0) continue

            let text = info[0]
            processedLines.push([text, 0])

            for (let i = 1; i < info.length; i++) {
                const el = info[i]
                text += el
                processedLines.push([text, text.length - el.length])
            }
        }

        this.currentIndex = -1
        this.lines = processedLines
        this.moveNext()
        this.dialogueBox.show()
    }

    hide() {
        this.dialogueBox.hide()
    }

    moveNext() {
        this.dialogueBox.skipAnimation()

        this.currentIndex++
        if (this.currentIndex < this.lines.length) {
            const info = this.lines[this.currentIndex]
            this.dialogueBox.setText(info[0] ?? '')
            this.dialogueBox.setInitialProgress(info[1] ?? 0)
            this.dialogueBox.draw()
        } else {
            this.lines = []
            this.hide()
        }
    }

    skipOrMoveNext() {
        // if the text is currently animating, skip and return
        if (this.dialogueBox.animating) {
            this.dialogueBox.skipAnimation()
            return
        }

        // otherwise, move to the next line
        this.moveNext()
    }
}