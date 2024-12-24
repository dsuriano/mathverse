export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        // Load assets
        this.load.image('background', 'assets/background.png');
        this.load.image('logo', 'assets/logo.png');
        this.load.image('button', 'assets/button.png');
    }

    create() {
        // Add space background with parallax stars
        this.createStarfield();

        // Add game title
        const title = this.add.text(640, 160, 'MathVerse', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#4444ff',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Create menu buttons
        this.createButton(640, 300, 'Single Player', () => this.scene.start('LevelSelectScene', { mode: 'single' }));
        this.createButton(640, 380, 'Multiplayer', () => this.scene.start('LevelSelectScene', { mode: 'multi' }));
        this.createButton(640, 460, 'Tutorial', () => this.scene.start('TutorialScene'));
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 300, 60, 0x4444ff, 0.8)
            .setInteractive()
            .on('pointerdown', callback)
            .on('pointerover', () => button.setFillStyle(0x6666ff, 0.8))
            .on('pointerout', () => button.setFillStyle(0x4444ff, 0.8));

        this.add.text(x, y, text, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
    }

    createStarfield() {
        const stars = [];
        for (let i = 0; i < 300; i++) {
            const x = Phaser.Math.Between(0, 1280);
            const y = Phaser.Math.Between(0, 720);
            const star = this.add.circle(x, y, 1, 0xffffff, Math.random());
            stars.push({ sprite: star, speed: Math.random() * 2 });
        }

        this.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 1000,
            repeat: -1,
            onUpdate: () => {
                stars.forEach(star => {
                    star.sprite.x -= star.speed;
                    if (star.sprite.x < 0) {
                        star.sprite.x = 1280;
                    }
                });
            }
        });
    }
}
