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
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
var background;
var balloons;
var eKey;
let needle;


function preload() {
    this.load.image('background', 'assets/background.webp');
    this.load.image('blue-balloon', 'assets/blue-balloon.png');
    this.load.image('red-balloon', 'assets/red-balloon.png');
    this.load.image('purple-balloon', 'assets/purple-balloon.png');
    this.load.image('white-balloon', 'assets/white-balloon.png');
    this.load.image('explosion', 'assets/explosion.png');
    this.load.image('bomb', 'assets/bomb.png');
}


function create() {
    setupBackground.call(this);
    setupKeyboard.call(this);
    setupBalloons.call(this);
    setupUI.call(this);
}

function setupBackground() {
    this.background = this.add.image(400, 300, 'background').setScale(2);
}

// metodo para configurar o teclado
function setupKeyboard() {
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.input.keyboard.on('keydown-E', function (event) {
        const pointer = this.input.activePointer;
        this.balloons.children.iterate(function (balloon) {
            if (balloon.getBounds().contains(pointer.x, pointer.y)) {
                showExplosion.call(this, balloon.x, balloon.y); // Adiciona a explosão
                if (balloon.texture.key === 'blue-balloon') {
                    balloon.destroy();
                    updateScore.call(this, 2);
                } else if (balloon.texture.key === 'red-balloon') {
                    balloon.destroy();
                    updateScore.call(this, 3);
                } else if (balloon.texture.key === 'purple-balloon') {
                    balloon.destroy();
                    updateScore.call(this, 5);
                } else if (balloon.texture.key === 'white-balloon') {
                    balloon.destroy();
                    updateScore.call(this, 10);
                } else if (balloon.texture.key === 'bomb') {
                    //end game or remove life
                    balloon.destroy();
                    loseLife.call(this);
                }
            }
        }, this);
    }, this);
}

// metodo para configurar os balões
function setupBalloons() {
    this.balloons = this.physics.add.group();

    // Adiciona balões azuis continuamente
    this.time.addEvent({
        delay: 750,
        callback: function () {
            createBlueBalloon(this);
        },
        callbackScope: this,
        loop: true
    });

    // Adiciona balões vermelhos continuamente
    this.time.addEvent({
        delay: 2000,
        callback: function () {
            if (this.timer > 10) {
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
            if (this.timer > 20) {
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
            if (this.timer > 30) {
                createWhiteBalloon(this);
            }
        },
        callbackScope: this,
        loop: true
    });

    // Adiciona bombas continuamente
    this.time.addEvent({
        delay: 5000,
        callback: function () {
            createBomb(this);
            
        },
        callbackScope: this,
        loop: true
    });
}

// metodo para criar balões
function createBlueBalloon(scene) {
    const x_blue = Phaser.Math.Between(50, 750);
    const blue_balloon = scene.balloons.create(x_blue, 600, 'blue-balloon');

    blue_balloon.setVelocityY(-100);
    blue_balloon.setInteractive();
    blue_balloon.setScale(0.2);

    //remove life if balloon is not clicked and goes out of screeneeeeeeee
}

function createRedBalloon(scene) {
    const x_red = Phaser.Math.Between(50, 750);
    const red_balloon = scene.balloons.create(x_red, 600, 'red-balloon');

    red_balloon.setVelocityY(-200);
    red_balloon.setInteractive();
    red_balloon.setScale(0.15);
}

function createPurpleBalloon(scene) {
    const x_purple = Phaser.Math.Between(50, 750);
    const purple_balloon = scene.balloons.create(x_purple, 600, 'purple-balloon');

    purple_balloon.setVelocityY(-250);
    purple_balloon.setInteractive();
    purple_balloon.setScale(0.2);
}

function createWhiteBalloon(scene) {
    const x_white = Phaser.Math.Between(50, 750);
    const white_balloon = scene.balloons.create(x_white, 600, 'white-balloon');

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

    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    this.timerText = this.add.text(16, 50, 'Time: 0', { fontSize: '32px', fill: '#000' });
    this.livesText = this.add.text(16, 84, 'Lives: 3', { fontSize: '32px', fill: '#000' });

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
    this.scoreText.setText('Score: ' + this.score);
}

function updateTimer() {
    this.timer++;
    this.timerText.setText('Time: ' + this.timer);
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
    this.livesText.setText('Lives: ' + this.lives);

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
        // Lógica para fim de jogo
        this.physics.pause();
        this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#f00' }).setOrigin(0.5);
    }
}

function update() {
}
