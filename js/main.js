const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        key: 'arcade',
        preload: preload,
        create: create,
        update: update
    }
};



const game = new Phaser.Game(config);


var background;
var balloons;
var eKey;
var rKey;
let needle;
var blue_balloon;
var gameOver = false;
let isPaused = false;
var timerEvent;
var popSound;
var bombSound;
var loseSound;
var gameOverSound;

function preload() {
    this.load.image('background', 'assets/background.webp');
    this.load.image('blue_balloon', 'assets/blue-balloon.png');
    this.load.image('red_balloon', 'assets/red-balloon.png');
    this.load.image('purple_balloon', 'assets/purple-balloon.png');
    this.load.image('white_balloon', 'assets/white-balloon.png');
    this.load.image('explosion', 'assets/explosion.png');
    this.load.image('bomb', 'assets/bomb.png');

    this.popSound = this.load.audio('pop', 'assets/ballon_pop.wav');
    this.bombSound = this.load.audio('bomb', 'assets/bomb_pop.wav');
    this.loseSound = this.load.audio('lose', 'assets/lose_life.wav');
    this.gameOverSound = this.load.audio('gameOver', 'assets/game_over.wav');

    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
}

function create() {
    gameOver = false;
    setupBackground.call(this);
    setupKeyboard.call(this);
    setupUI.call(this);
    this.balloons = this.physics.add.group();
    setupBalloons.call(this);
    setupBomb.call(this);

    WebFont.load({
        custom: {
            families: ['Stopbuck'],
            urls: ['/fonts/styles.css'] 
        },
        active: function() {
            // Aplicar a fonte carregada aos textos
            this.scoreText.setFontFamily('Stopbuck');
            this.timerText.setFontFamily('Stopbuck');
            this.livesText.setFontFamily('Stopbuck');
        }.bind(this)
    });

    popSound = this.sound.add('pop');
    bombSound = this.sound.add('bomb');
    loseSound = this.sound.add('lose');
    gameOverSound = this.sound.add('gameOver');
}

function setupBackground() {
    this.background = this.add.image(400, 300, 'background').setScale(2);
}

function setupKeyboard() {
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.input.keyboard.on('keydown-E', function (event) {
        if (gameOver) return; // Não faz nada se o jogo terminou
        const pointer = this.input.activePointer;
        this.balloons.children.iterate(function (balloon) {
            if (balloon.getBounds().contains(pointer.x, pointer.y)) {
                showExplosion.call(this, balloon.x, balloon.y); // Adiciona a explosão
                if (balloon.texture.key === 'blue_balloon') {
                    balloon.destroy();
                    popSound.play();
                    updateScore.call(this, 2);
                } else if (balloon.texture.key === 'red_balloon') {
                    balloon.destroy();
                    popSound.play();
                    updateScore.call(this, 3);
                } else if (balloon.texture.key === 'purple_balloon') {
                    balloon.destroy();
                    popSound.play();
                    updateScore.call(this, 5);
                } else if (balloon.texture.key === 'white_balloon') {
                    balloon.destroy();
                    popSound.play();
                    updateScore.call(this, 10);
                } else if (balloon.texture.key === 'bomb') {
                    balloon.destroy();
                    bombSound.play();
                    loseLife.call(this);
                }
            }
        }, this);
    }, this);

    var scene = this;

    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.rKey.on('down', function() {
        // Reset do jogo
        this.scene.restart();
    }, this);
}

function setupBalloons() {
    // Adiciona balões azuis continuamente
    this.time.addEvent({
        delay: 750,
        callback: function () {
            if (!gameOver) createBlueBalloon(this);
        },
        callbackScope: this,
        loop: true
    });

    // Adiciona balões vermelhos continuamente
    this.time.addEvent({
        delay: 2000,
        callback: function () {
            if (!gameOver && this.timer > 10) {
                createRedBalloon(this);
            }
        },
        callbackScope: this,
        loop: true
    });

    // Adiciona balões roxos continuamente
    this.time.addEvent({
        delay: 2500,
        callback: function () {
            if (!gameOver && this.timer > 20) {
                createPurpleBalloon(this);
            }
        },
        callbackScope: this,
        loop: true
    });

    // Adiciona balões brancos continuamente
    this.time.addEvent({
        delay: 3500,
        callback: function () {
            if (!gameOver && this.timer > 30) {
                createWhiteBalloon(this);
            }
        },
        callbackScope: this,
        loop: true
    });
}

function setupBomb() {
    // Adiciona bombas continuamente
    this.time.addEvent({
        delay: 5000,
        callback: function () {
            if (!gameOver) createBomb(this);
        },
        callbackScope: this,
        loop: true
    });
}

function createBlueBalloon(scene) {
    const x_blue = Phaser.Math.Between(50, 750);
    const blue_balloon = scene.balloons.create(x_blue, 600, 'blue_balloon');
    blue_balloon.setVelocityY(-100);
    blue_balloon.setInteractive();
    blue_balloon.setScale(0.2);
}

function createRedBalloon(scene) {
    const x_red = Phaser.Math.Between(50, 750);
    const red_balloon = scene.balloons.create(x_red, 600, 'red_balloon');
    red_balloon.setVelocityY(-200);
    red_balloon.setInteractive();
    red_balloon.setScale(0.15);
}

function createPurpleBalloon(scene) {
    const x_purple = Phaser.Math.Between(50, 750);
    const purple_balloon = scene.balloons.create(x_purple, 600, 'purple_balloon');
    purple_balloon.setVelocityY(-250);
    purple_balloon.setInteractive();
    purple_balloon.setScale(0.2);
}

function createWhiteBalloon(scene) {
    const x_white = Phaser.Math.Between(50, 750);
    const white_balloon = scene.balloons.create(x_white, 600, 'white_balloon');
    white_balloon.setVelocityY(-300);
    white_balloon.setInteractive();
    white_balloon.setScale(0.2);
}

function createBomb(scene) {
    const x_bomb = Phaser.Math.Between(50, 750);
    const bomb = scene.balloons.create(x_bomb, 600, 'bomb');
    bomb.setVelocityY(-225);
    bomb.setInteractive();
    bomb.setScale(0.25);
}

function setupUI() {
    this.score = 0;
    this.timer = 0;
    this.lives = 3;

    this.scoreText = this.add.text(20, 16, '<Score: 0>', { fontSize: '32px', fill: '#000'});
    this.timerText = this.add.text(630, 16, '<Time: 0>', { fontSize: '32px', fill: '#000' });
    this.livesText = this.add.text(330, 16, '<Lives: 3>', { fontSize: '32px', fill: '#000' });

    // Atualiza o cronômetro a cada segundo
    this.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });
}

function updateScore(points) {
    this.score += points;
    this.scoreText.setText('<Score: ' + this.score + '>');
}

function updateTimer() {
    if (!gameOver) {
        this.timer++;
        this.timerText.setText('<Time: ' + this.timer + '>');
    }
}

function showExplosion(x, y) {
    const explosion = this.add.image(x, y, 'explosion').setScale(0.1);

    // Remove a imagem de explosão após um curto período
    this.time.addEvent({
        delay: 100,
        callback: function () {
            explosion.destroy();
        },
        callbackScope: this
    });
}

function loseLife() {
    this.lives--;
    this.livesText.setText('<Lives: ' + this.lives + '>');

    // Create a semi-transparent red rectangle
    let redFlash = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xff0000);
    redFlash.setAlpha(0.5);
    redFlash.setOrigin(0, 0);
    redFlash.setDepth(9999);

    // Create a tween to pulse the red rectangle
    this.tweens.add({
        targets: redFlash,
        alpha: { from: 0.5, to: 0 },
        ease: 'Sine.easeInOut',
        duration: 100,
        repeat: 3,
        yoyo: true,
        onComplete: function () {
            redFlash.destroy();
        }
    });

    if (this.lives <= 0) {
        gameOver = true;
        this.physics.pause();
    
        // Add a semi-transparent black background
        let background = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000);
        background.setOrigin(0, 0);
        background.setAlpha(0.5);
    
        this.add.text(400, 300, '<Game Over>', { fontSize: '64px', fill: '#f00', fontFamily: 'Stopbuck' }).setOrigin(0.5);
        gameOverSound.play();
    }
}

function update() {
    if (gameOver && this.rKey.isDown){
        this.scene.restart();
    }

    // Verifica se algum balão saiu do ecrã
    this.balloons.children.iterate(function (balloon) {
        if (balloon && balloon.y < 0) {
            if (balloon.texture.key !== 'bomb') { 
                loseLife.call(this); 
                loseSound.play();
            }
            balloon.destroy();
        }
    }, this);
}
