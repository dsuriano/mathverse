export default class TopicSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TopicSelectScene' });
        this.topics = {
            'Elementary': ['Addition', 'Subtraction', 'Multiplication', 'Division'],
            'Middle School': ['Fractions', 'Decimals', 'Basic Algebra', 'Geometry'],
            'High School': ['Advanced Algebra', 'Trigonometry', 'Probability', 'Statistics']
        };
    }

    init(data) {
        this.gameMode = data.mode;
        this.difficulty = data.difficulty;
    }

    create() {
        // Add background with gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x000033, 0x000033, 0x000066, 0x000066, 1);
        bg.fillRect(0, 0, 1280, 720);
        
        // Add title with glow effect
        const title = this.add.text(640, 80, `Select ${this.difficulty} Topic`, {
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

        // Create topic buttons
        const topics = this.topics[this.difficulty];
        const columns = 2;
        const rows = Math.ceil(topics.length / columns);
        const buttonWidth = 300;
        const buttonHeight = 80;
        const spacing = 40;
        const startX = 640 - (buttonWidth + spacing) * (columns - 1) / 2;
        const startY = 250;

        topics.forEach((topic, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;
            const x = startX + col * (buttonWidth + spacing);
            const y = startY + row * (buttonHeight + spacing);

            // Topic container
            const container = this.add.container(x, y);
            
            // Topic button with gradient
            const button = this.add.graphics();
            button.fillGradientStyle(0x33aa33, 0x33aa33, 0x227722, 0x227722, 0.8);
            button.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 16);
            container.add(button);

            // Topic text
            const text = this.add.text(0, 0, topic, {
                fontSize: '28px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            container.add(text);

            // Make container interactive
            container.setSize(buttonWidth, buttonHeight);
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
                    this.startGame(topic);
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
            .on('pointerdown', () => {
                this.scene.start('LevelSelectScene', { mode: this.gameMode });
            });
    }

    startGame(topic) {
        this.scene.start('GameScene', {
            mode: this.gameMode,
            difficulty: this.difficulty,
            topic: topic
        });
    }
}
