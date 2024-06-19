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
var balloon;
var eKey;
var rKey;
let needle;
var blue_balloon;
var gameOver = false;
let isPaused = false;
var gameStarted = false;
var timerEvent;
var popSound;
var bombSound;
var loseSound;
var gameOverSound;
let poppedBallons = [];
var comboText;
var combo = 0;
var scoreText;
var spaceText;
var topScoresText;
var topScores = [];


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
    gameStarted = false;
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
        active: function () {
            // Aplicar a fonte carregada aos textos
            this.scoreText.setFontFamily('Stopbuck');
            this.timerText.setFontFamily('Stopbuck');
            this.livesText.setFontFamily('Stopbuck');
        }.bind(this)
    });
    
    popSound = this.sound.add('pop', { volume: 0.5 });
    bombSound = this.sound.add('bomb', { volume: 0.2 });
    loseSound = this.sound.add('lose');
    gameOverSound = this.sound.add('gameOver');

    createMenu.call(this);
}

function createMenu() {
    menu = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000);
    menu.setOrigin(0, 0);
    menu.alpha = 0.5;

    spaceText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Press SPACE to start', { fontFamily: 'Stopbuck', fontSize: '32px', color: '#ffffff' });
    spaceText.setOrigin(0.5, 0.5);

    topScoresText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'Top Scores', { fontFamily: 'Stopbuck', fontSize: '32px', color: '#ffffff' });
    topScoresText.setOrigin(0.5, 0.5);

    // Obtém os top 10 scores do localStorage
    let topScores = JSON.parse(localStorage.getItem('topScores')) || [];
    let topScoresTexts = []; 

    for (let i = 0; i < topScores.length; i++) {
        let scoreText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 80 + (i * 20), `${i + 1}. ${topScores[i]}`, { fontFamily: 'Stopbuck', fontSize: '20px', color: '#ffffff' });
        scoreText.setOrigin(0.5, 0.5);
        topScoresTexts.push(scoreText); // Armazena a referência do texto no array
    }

    this.input.keyboard.on('keydown-SPACE', function () {
        if (gameOver) {
            saveScore(this.score);
            this.scene.restart();
        } else {
            menu.destroy();
            spaceText.destroy();
            topScoresText.destroy();

            for (let i = 0; i < topScoresTexts.length; i++) {
                topScoresTexts[i].destroy();
            }

            gameStarted = true;
            startGame.call(this);
        }
    }, this);

    this.input.keyboard.on('keydown-R', function () {
        saveScore(this.score);

        this.scene.restart();

        gameStarted = false;
        createMenu.call(this);
    }, this);
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
            if (balloon && balloon.getBounds().contains(pointer.x, pointer.y)) {
                showExplosion.call(this, balloon.x, balloon.y); // Adiciona a explosão
                if (balloon.texture.key === 'blue_balloon') {
                    balloon.destroy();
                    popSound.play();
                    updateScore.call(this, 2);
                    popBalloon(this, 'blue_balloon');
                } else if (balloon.texture.key === 'red_balloon') {
                    balloon.destroy();
                    popSound.play();
                    updateScore.call(this, 3);
                    popBalloon(this, 'red_balloon');
                } else if (balloon.texture.key === 'purple_balloon') {
                    balloon.destroy();
                    popSound.play();
                    updateScore.call(this, 5);
                    popBalloon(this, 'purple_balloon');
                } else if (balloon.texture.key === 'white_balloon') {
                    balloon.destroy();
                    popSound.play();
                    updateScore.call(this, 10);
                    popBalloon(this, 'white_balloon');
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

    // Reiniciar jogo
    this.rKey.on('down', function () {
        this.scene.restart();
    }, this);
}

function setupBalloons() {
    this.time.addEvent({
        delay: 750,
        callback: function () {
            if (!gameOver && gameStarted) createBlueBalloon(this);
        },
        callbackScope: this,
        loop: true
    });

    this.time.addEvent({
        delay: 2000,
        callback: function () {
            if (!gameOver && gameStarted && this.timer > 10) {
                createRedBalloon(this);
            }
        },
        callbackScope: this,
        loop: true
    });

    this.time.addEvent({
        delay: 2500,
        callback: function () {
            if (!gameOver && gameStarted && this.timer > 20) {
                createPurpleBalloon(this);
            }
        },
        callbackScope: this,
        loop: true
    });

    this.time.addEvent({
        delay: 3500,
        callback: function () {
            if (!gameOver && gameStarted && this.timer > 30) {
                createWhiteBalloon(this);
                createRedBalloon(this);
            }
        },
        callbackScope: this,
        loop: true
    });
}

function setupBomb() {
    this.time.addEvent({
        delay: 5000,
        callback: function () {
            if (!gameOver && gameStarted) createBomb(this);
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

function popBalloon(scene, balloonType) {
    const lastBalloonType = poppedBallons[poppedBallons.length - 1];

    if (lastBalloonType && lastBalloonType === balloonType) {
        combo = 0;
        poppedBallons = [];
    } else {
        combo++;
        poppedBallons.push(balloonType);
    }

    if (combo > 1) {
        if (comboText) comboText.destroy();
        comboText = scene.add.text(400, 100, 'X' + combo, { fontSize: '48px', fill: '#ff0', fontFamily: 'StopBuck' }).setOrigin(0.5);

        scene.time.addEvent({
            delay: 1000,
            callback: function () {
                comboText.destroy();
            },
            callbackScope: scene
        });
    }
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

    this.scoreText = this.add.text(20, 16, '<Score: 0>', { fontSize: '32px', fill: '#000' });
    this.timerText = this.add.text(630, 16, '<Time: 0>', { fontSize: '32px', fill: '#000' });
    this.livesText = this.add.text(330, 16, '<Lives: 3>', { fontSize: '32px', fill: '#000' });

    // Atualiza o timer a cada segundo
    this.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });
}

function updateScore(points) {
    if (combo > 1) {
        this.score += points * combo;
    } else {
        this.score += points;
    }
    this.scoreText.setText('<Score: ' + this.score + '>');
}

function updateTimer() {
    if (!gameOver && gameStarted) {
        this.timer++;
        this.timerText.setText('<Time: ' + this.timer + '>');
    }
}

function showExplosion(x, y) {
    const explosion = this.add.image(x, y, 'explosion').setScale(0.1);

    // Remove a imagem de explosão após 100ms
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

    let redFlash = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xff0000);
    redFlash.setAlpha(0.5);
    redFlash.setOrigin(0, 0);
    redFlash.setDepth(9999);

    // Animação de flash vermelho
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

        let background = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000);
        background.setOrigin(0, 0);
        background.setAlpha(0.5);

        this.add.text(400, 300, '<Game Over>', { fontSize: '64px', fill: '#f00', fontFamily: 'Stopbuck' }).setOrigin(0.5);
        gameOverSound.play();
    }
}

function saveScore(score) {
    let scores = JSON.parse(localStorage.getItem('topScores')) || [];
    scores.push(score);
    scores.sort((a, b) => b - a);
    scores = scores.slice(0, 10); // Mantém apenas os top 10 scores
    localStorage.setItem('topScores', JSON.stringify(scores));
}


function update() {
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