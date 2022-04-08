/**
 * Parts of code from http://phaser.io/tutorials/making-your-first-phaser-3-game
 * Modified by Omar M.
 */

const MAX_WIDTH = 1454;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SCROLL_PERCENT = 0.2;
const MIN_SCROLL = -(MAX_WIDTH - CANVAS_WIDTH);
const SCROLL_DELTA = 3;

const LEFT_SCROLL_BORDER = CANVAS_WIDTH * SCROLL_PERCENT;
const RIGHT_SCROLL_BORDER = CANVAS_WIDTH - LEFT_SCROLL_BORDER;

let player, cursors, enemyCursors;
let bg, platforms, fireEvent;

// this implementation of firing is not very good & should change
// just keeping it simple right now for the demo
let playerFiring = false;
let playerFacing = 1;

function preload() {
    this.load.image('bg', 'assets/scrolltest.png');
    this.load.image('fireball', 'assets/fireball.png');
    this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
    this.load.spritesheet('antidude',
        'assets/antidude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

function create() {
    cursors = this.input.keyboard.createCursorKeys();

    // for demo purposes
    cursors.hide = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    cursors.show = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    enemyCursors = {
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        hide: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    };

    // initialize background
    bg = this.add.image(0, 0, 'bg');
    bg.setOrigin(0, 0);

    // initialize platforms
    const platformDefs = [
        // ground platform
        {x: 0, y: 575, w: CANVAS_WIDTH, h: 1}
    ];

    platforms = this.physics.add.staticGroup();
    for (let i = 0; i < platformDefs.length; i++) {
        const info = platformDefs[i];
        const sprite = platforms.create(info.x, info.y, null, null, false);
        sprite.displayWidth = 1;
        sprite.setOrigin(0, 0);

        sprite.enableBody();
        sprite.setSize(info.w, info.h, 0)
    }

    // not how lucy will actually look, but fine for a mockup
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setOrigin(0, 0);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // demo enemy
    enemy = this.physics.add.sprite(700, 450, 'antidude');
    enemy.setOrigin(0, 0);
    enemy.setBounce(0.2);
    enemy.setCollideWorldBounds(true);

    platforms.refresh();
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(enemy, platforms);

    const animSprites = ['dude', 'antidude'];
    for (const el of animSprites) {
        // initialize animations
        this.anims.create({
            key: `${el}_left`,
            frames: this.anims.generateFrameNumbers(el, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.anims.create({
            key: `${el}_turn`,
            frames: [ { key: el, frame: 4 } ],
            frameRate: 20
        });
    
        this.anims.create({
            key: `${el}_right`,
            frames: this.anims.generateFrameNumbers(el, { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

    fireEvent = this.time.addEvent({
       loop: true,
       delay: 1000,
       callback:  function() {
            if (!playerFiring) return;

            const fireball = this.physics.add.sprite(player.x, player.y, 'fireball');
            fireball.setOrigin(0, 0);
            //fireball.setCollideWorldBounds(true);
            fireball.lifespan = 10;
            fireball.setVelocityX(playerFacing * 200);
            fireball.setImmovable(false);

            fireball.body.setAllowGravity(false);

            this.time.addEvent({
                delay: 5000,
                callback: () => fireball.destroy()
            })
        },
        callbackScope: this
    });
}

function update() {
    if (cursors.left.isDown) {
        playerFacing = -1;
        player.setVelocityX(-160);
        player.anims.play('dude_left', true);

        // handling it with a scroll border right now, but it should ultimately be a "region"
        // region implementation should help avoid player's choppiness while scrolling
        if (player.x <= LEFT_SCROLL_BORDER && bg.x < 0) {
            bg.x += SCROLL_DELTA;
            player.x += SCROLL_DELTA;

            if (bg.x > 0) bg.x = 0;
        }
    } else if (cursors.right.isDown) {
        playerFacing = 1;
        player.setVelocityX(160);
        player.anims.play('dude_right', true);

        if (player.x >= RIGHT_SCROLL_BORDER && bg.x > MIN_SCROLL) {
            bg.x -= SCROLL_DELTA;
            player.x -= SCROLL_DELTA;
        }

        if (bg.x < MIN_SCROLL) bg.x = MIN_SCROLL;
    } else {
        player.setVelocityX(0);
        player.anims.play('dude_turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-300);
    }

    // for demo purposes
    playerFiring = cursors.space.isDown;
    if (cursors.hide.isDown) {
        player.setVisible(false);
    } else if (cursors.show.isDown) {
        player.setVisible(true);
    }

    // simulating an enemy by controlling it
    if (enemyCursors.left.isDown) {
        enemy.setVelocityX(-160);
        enemy.anims.play('antidude_left', true);
    } else if (enemyCursors.right.isDown) {
        enemy.setVelocityX(160);
        enemy.anims.play('antidude_right', true);
    } else {
        enemy.setVelocityX(0);
        enemy.anims.play('antidude_turn');
    }

    if (enemyCursors.hide.isDown) {
        enemy.setVisible(false);
    }
}

const config = {
    type: Phaser.AUTO,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
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
