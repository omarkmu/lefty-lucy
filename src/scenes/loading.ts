// Authors: Omar Muhammad
// Adapted from https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3


const ELLIPSIS_DELAY = 250

// not extending the base scene; this is a special case
export default class LoadingScreen extends Phaser.Scene {
    ellipsisEvent: Phaser.Time.TimerEvent

    drawLoadingElements() {
        const progressBar = this.add.graphics()
        const progressBox = this.add.graphics()
        progressBox.fillStyle(0x222222, 0.8)
        progressBox.fillRect(240, 270, 320, 50)

        const width = this.cameras.main.width
        const height = this.cameras.main.height
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading',
            style: {
                font: '20px monospace',
                stroke: '#ffffff'
            },
            origin: 0.5
        })

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                stroke: '#ffffff'
            },
            origin: 0.5
        })

        let i = 0
        this.ellipsisEvent = this.time.addEvent({
            loop: true,
            delay: ELLIPSIS_DELAY,
            callback: () => loadingText.setText(`Loading${'.'.repeat(1 + i++ % 3)}`)
        })

        this.load.on('progress', (value: number) => {
            percentText.setText(parseInt((value * 100) as any) + '%')
            progressBar.clear()
            progressBar.fillStyle(0xffffff, 1)
            progressBar.fillRect(250, 280, 300 * value, 30)
        })

        this.load.on('complete', () => {
            progressBar.destroy()
            progressBox.destroy()
            loadingText.destroy()
            percentText.destroy()
        })
    }

    preload() {
        this.drawLoadingElements()

        // ui assets
        this.load.image('heart', 'assets/heart.png')
        this.load.image('glass-panel', 'assets/glassPanel.png')
        this.load.image('cursor_pointerFlat_shadow', 'assets/cursor_pointerFlat_shadow.png')

        // level assets
        this.load.image('menu', 'assets/leftylucyfront2.png')
        this.load.image('victory', 'assets/leftylucyfront1.png')
        this.load.image('backstory', 'assets/backstory.png')
        this.load.image('bg', 'assets/forest_background.png')
        this.load.image('home', 'assets/lucyhousebackground2.png')
        this.load.image('forestpath', 'assets/forest_background.png')
        this.load.image('town', 'assets/town_background.png')
        this.load.image('mountainpath', 'assets/mountain_background.png')
        this.load.image('cave', 'assets/cave_background.png')
        this.load.image('cavepath', 'assets/innercave.png')
        this.load.image('platform', 'assets/5.png')
        this.load.image('sideways', 'assets/sideways.png')

        //sound effects and songs
        this.load.audio('lvl1', 'assets/plucky.mp3')
        this.load.audio('lvl3', 'assets/creepy_bugs.mp3')
        this.load.audio('lvl2', 'assets/something_adventerous.wav')
        this.load.audio('lvl', 'assets/sound.mp3')
        this.load.audio('hurt', 'assets/hurt.mp3')
        this.load.audio('heal', 'assets/heal.mp3')
        this.load.audio('punch', 'assets/punch.mp3')
        this.load.audio('swoosh', 'assets/swoosh.mp3')
        this.load.audio('sword', 'assets/sword.wav')
        this.load.audio('home/town', 'assets/kind_of_soothing_kind_of.mp3')

        // player assets
        this.load.image('fireball', 'assets/fireballpix.png')
        this.load.spritesheet('lucy_jump_and_punch', 'assets/lucyjumpandpunch.png', {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 5,
        })
        this.load.spritesheet('lucy_jump_and_punch_sword', 'assets/lucysword2.png', {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 5,
        })
        this.load.spritesheet('lucy_walk', 'assets/lucywalkcycle.png', {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 7,
        })
        this.load.spritesheet('lucy_walk_sword', 'assets/lucywalkcycle_sword.png', {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 7,
        })

        // enemy assets
        this.load.spritesheet('enemy_walk', 'assets/genenemywalkcycle.png', {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 7,
        })
        this.load.spritesheet('enemy_punch', 'assets/enemypunching.png', {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 3,
        })

        // boss assets
        this.load.spritesheet('boss_walk', 'assets/finalbosswalkcycle.png', {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 7,
        })
        this.load.spritesheet('boss_punch', 'assets/finalbosspunching.png', {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 3,
        })

        // npc assets
        this.load.image('mom_stand', 'assets/lucymomfront.png')
        this.load.image('civilian_stand', 'assets/townsperson.png')
        this.load.image('civilianblue_stand', 'assets/townspersonblue.png')
        this.load.image('civiliangreen_stand', 'assets/townspersongreen.png')
        this.load.image('civilianpurple_stand', 'assets/townspersonpurple.png')
        this.load.image('guerrilla_stand', 'assets/resistance.png')
    }

    create() {
        this.ellipsisEvent?.remove()

        // player animations
        this.anims.create({
            key: 'lucy_stand_left',
            frames: [{ frame: 1 }],
            defaultTextureKey: 'lucy_walk'
        })
        this.anims.create({
            key: 'lucy_stand_right',
            frames: [{ frame: 5 }],
            defaultTextureKey: 'lucy_walk'
        })
        this.anims.create({
            key: 'lucy_stand_sword_left',
            frames: [{ frame: 1 }],
            defaultTextureKey: 'lucy_walk_sword'
        })
        this.anims.create({
            key: 'lucy_stand_sword_right',
            frames: [{ frame: 5 }],
            defaultTextureKey: 'lucy_walk_sword'
        })

        this.anims.create({
            key: 'lucy_walk_left',
            frames: this.anims.generateFrameNumbers('lucy_walk', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'lucy_walk_right',
            frames: this.anims.generateFrameNumbers('lucy_walk', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'lucy_walk_sword_left',
            frames: this.anims.generateFrameNumbers('lucy_walk_sword', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'lucy_walk_sword_right',
            frames: this.anims.generateFrameNumbers('lucy_walk_sword', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'lucy_jump_left',
            frames: [{ frame: 2 }],
            defaultTextureKey: 'lucy_jump_and_punch'
        })
        this.anims.create({
            key: 'lucy_jump_right',
            frames: [{ frame: 5 }],
            defaultTextureKey: 'lucy_jump_and_punch'
        })
        this.anims.create({
            key: 'lucy_jump_sword_left',
            frames: [{ frame: 2 }],
            defaultTextureKey: 'lucy_jump_and_punch_sword'
        })
        this.anims.create({
            key: 'lucy_jump_sword_right',
            frames: [{ frame: 5 }],
            defaultTextureKey: 'lucy_jump_and_punch_sword'
        })

        this.anims.create({
            key: 'lucy_punch_left',
            frames: [
                { frame: 0 },
                { frame: 1 },
            ],
            frameRate: 10,
            defaultTextureKey: 'lucy_jump_and_punch'
        })
        this.anims.create({
            key: 'lucy_punch_right',
            frames: [
                { frame: 3 },
                { frame: 4 },
            ],
            frameRate: 10,
            defaultTextureKey: 'lucy_jump_and_punch'
        })
        this.anims.create({
            key: 'lucy_sword_left',
            frames: [
                { frame: 0 },
                { frame: 1 },
            ],
            frameRate: 10,
            defaultTextureKey: 'lucy_jump_and_punch_sword'
        })
        this.anims.create({
            key: 'lucy_sword_right',
            frames: [
                { frame: 3 },
                { frame: 4 },
            ],
            frameRate: 10,
            defaultTextureKey: 'lucy_jump_and_punch_sword'
        })

        // enemy animations
        this.anims.create({
            key: 'enemy_stand_left',
            frames: [{ frame: 1 }],
            defaultTextureKey: 'enemy_walk'
        })
        this.anims.create({
            key: 'enemy_stand_right',
            frames: [{ frame: 5 }],
            defaultTextureKey: 'enemy_walk'
        })
        this.anims.create({
            key: 'enemy_walk_left',
            frames: this.anims.generateFrameNumbers('enemy_walk', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'enemy_walk_right',
            frames: this.anims.generateFrameNumbers('enemy_walk', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'enemy_punch_left',
            frames: this.anims.generateFrameNumbers('enemy_punch', { start: 0, end: 1 }),
            frameRate: 10
        })
        this.anims.create({
            key: 'enemy_punch_right',
            frames: this.anims.generateFrameNumbers('enemy_punch', { start: 2, end: 3 }),
            frameRate: 10
        })

        // boss animations
        this.anims.create({
            key: 'boss_stand_left',
            frames: [{ frame: 1 }],
            defaultTextureKey: 'boss_walk'
        })
        this.anims.create({
            key: 'boss_stand_right',
            frames: [{ frame: 5 }],
            defaultTextureKey: 'boss_walk'
        })
        this.anims.create({
            key: 'boss_walk_left',
            frames: this.anims.generateFrameNumbers('boss_walk', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'boss_walk_right',
            frames: this.anims.generateFrameNumbers('boss_walk', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'boss_punch_left',
            frames: this.anims.generateFrameNumbers('boss_punch', { start: 0, end: 1 }),
            frameRate: 10
        })
        this.anims.create({
            key: 'boss_punch_right',
            frames: this.anims.generateFrameNumbers('boss_punch', { start: 2, end: 3 }),
            frameRate: 10
        })

        this.scene.start('main-menu')
    }
}
