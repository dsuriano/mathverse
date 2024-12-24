export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
        this.categories = [
            { name: 'Elementary', topics: ['Addition', 'Subtraction', 'Multiplication', 'Division'] },
            { name: 'Middle School', topics: ['Fractions', 'Decimals', 'Basic Algebra', 'Geometry'] },
            { name: 'High School', topics: ['Advanced Algebra', 'Trigonometry', 'Probability', 'Statistics'] }
        ];
    }

    init(data) {
        this.gameMode = data.mode;
    }

    create() {
        // Add background
        this.add.rectangle(0, 0, 1280, 720, 0x000033).setOrigin(0);
        
        // Add title
        this.add.text(640, 80, 'Select Your Level', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Create buttons for each category
        this.categories.forEach((category, index) => {
            const y = 200 + index * 120;
            
            // Category button
            const button = this.add.rectangle(640, y, 400, 80, 0x4444ff, 0.8)
                .setInteractive()
                .on('pointerover', () => {
                    button.setFillStyle(0x6666ff, 0.8);
                    this.showTopics(category, y);
                })
                .on('pointerout', () => {
                    button.setFillStyle(0x4444ff, 0.8);
                });

            // Category text
            this.add.text(640, y, category.name, {
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            // Create topic buttons for this category
            this.createTopicButtons(category, y);
        });

        // Back button
        const backButton = this.add.rectangle(100, 650, 150, 50, 0x4444ff, 0.8)
            .setInteractive()
            .on('pointerover', () => backButton.setFillStyle(0x6666ff, 0.8))
            .on('pointerout', () => backButton.setFillStyle(0x4444ff, 0.8))
            .on('pointerdown', () => this.scene.start('MainMenuScene'));

        this.add.text(100, 650, 'Back', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    createTopicButtons(category, categoryY) {
        const topicGroup = this.add.group();
        
        category.topics.forEach((topic, index) => {
            const x = 640 + (index - 1.5) * 250;
            const y = categoryY + 60;
            
            // Topic button background
            const topicButton = this.add.rectangle(x, y, 200, 40, 0x33aa33, 0.8)
                .setInteractive()
                .on('pointerover', () => topicButton.setFillStyle(0x44cc44, 0.8))
                .on('pointerout', () => topicButton.setFillStyle(0x33aa33, 0.8))
                .on('pointerdown', () => this.startGame(topic));

            // Topic text
            const topicText = this.add.text(x, y, topic, {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            // Initially hide the topic buttons
            topicButton.setVisible(false);
            topicText.setVisible(false);

            // Add to group for easy management
            topicGroup.add(topicButton);
            topicGroup.add(topicText);
        });

        // Store the group reference with the category
        this[`topicGroup_${categoryY}`] = topicGroup;
    }

    showTopics(category, categoryY) {
        // Hide all topic groups first
        this.categories.forEach((_, index) => {
            const y = 200 + index * 120;
            if (this[`topicGroup_${y}`]) {
                this[`topicGroup_${y}`].getChildren().forEach(child => child.setVisible(false));
            }
        });

        // Show only the topics for the selected category
        const topicGroup = this[`topicGroup_${categoryY}`];
        if (topicGroup) {
            topicGroup.getChildren().forEach(child => child.setVisible(true));
        }
    }

    startGame(topic) {
        this.scene.start('GameScene', {
            mode: this.gameMode,
            topic: topic
        });
    }
}
