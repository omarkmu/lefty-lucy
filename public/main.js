/**
 * Parts of code from http://phaser.io/tutorials/making-your-first-phaser-3-game
 * Modified by Omar M.
 */

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

let player, cursors
let bg, platforms;

function preload() {
    this.load.image('bg', 'assets/scrolltest.png');
    this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

function create() {
    cursors = this.input.keyboard.createCursorKeys();

    // initialize background
    bg = this.add.image(727, 300, 'bg');

    // initialize platforms
    let platformDefs = [
        // ground platform
        {x: 0, y: 570, w: CANVAS_WIDTH, h: 1}
    ];

    platforms = this.physics.add.staticGroup();
    for (let i = 0; i < platformDefs.length; i++) {
        const info = platformDefs[i];
        const sprite = platforms.create(info.x, info.y, null, null, true);
        sprite.displayWidth = 1;

        sprite.enableBody();
        sprite.setSize(info.w, info.h, 0)
    }

    // not how lucy will actually look, but fine for a mockup
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    platforms.refresh();
    this.physics.add.collider(player, platforms);

    // initialize animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.down.isDown) {
        console.log(player);
        console.log(bg);
    }

    if (cursors.up.isDown /*&& player.body.touching.down*/) {
        player.setVelocityY(-160);
    }
}

const config = {
    type: Phaser.AUTO,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
