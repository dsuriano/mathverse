export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
        this.difficulties = ['Elementary', 'Middle School', 'High School'];
    }

    init(data) {
        this.gameMode = data.mode;
    }

    create() {
        // Add background with gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x000033, 0x000033, 0x000066, 0x000066, 1);
        bg.fillRect(0, 0, 1280, 720);
        
        // Add title with glow effect
        const title = this.add.text(640, 80, 'Select Difficulty', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Add glow effect to title
        this.tweens.add({
            targets: title,
            scale: 1.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Create buttons for each difficulty
        this.difficulties.forEach((difficulty, index) => {
            const y = 250 + index * 120;
            
            // Difficulty container
            const container = this.add.container(640, y);
            
            // Difficulty button with gradient
            const button = this.add.graphics();
            button.fillGradientStyle(0x4444ff, 0x4444ff, 0x2222aa, 0x2222aa, 0.8);
            button.fillRoundedRect(-200, -40, 400, 80, 16);
            container.add(button);

            // Difficulty text
            const text = this.add.text(0, 0, difficulty, {
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            container.add(text);

            // Make container interactive
            container.setSize(400, 80);
            container.setInteractive()
                .on('pointerover', () => {
                    this.tweens.add({
                        targets: container,
                        scaleX: 1.05,
                        scaleY: 1.05,
                        duration: 200,
                        ease: 'Power2'
                    });
                })
                .on('pointerout', () => {
                    this.tweens.add({
                        targets: container,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 200,
                        ease: 'Power2'
                    });
                })
                .on('pointerdown', () => {
                    this.scene.start('TopicSelectScene', { 
                        mode: this.gameMode,
                        difficulty: difficulty
                    });
                });
        });

        // Back button
        const backContainer = this.add.container(100, 650);
        
        const backButton = this.add.graphics();
        backButton.fillGradientStyle(0x4444ff, 0x4444ff, 0x2222aa, 0x2222aa, 0.8);
        backButton.fillRoundedRect(-75, -25, 150, 50, 10);
        backContainer.add(backButton);

        const backText = this.add.text(0, 0, 'Back', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        backContainer.add(backText);

        backContainer.setSize(150, 50);
        backContainer.setInteractive()
            .on('pointerover', () => {
                this.tweens.add({
                    targets: backContainer,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 200
                });
            })
            .on('pointerout', () => {
                this.tweens.add({
                    targets: backContainer,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200
                });
            })
            .on('pointerdown', () => this.scene.start('MainMenuScene'));
    }
}
