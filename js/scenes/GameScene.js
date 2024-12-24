export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.currentProblem = null;
        this.fallingAnswers = [];
        this.bullets = [];
        this.lastShootTime = 0;
        this.shootDelay = 250; // Minimum time between shots in ms
        this.stars = [];
        this.lastAnswerSpawnTime = 0;
        this.answerSpawnDelay = 2000; // Spawn new answer every 2 seconds
    }

    init(data) {
        this.gameMode = data.mode;
        this.topic = data.topic;
        this.difficulty = 1;
    }

    preload() {
        this.generateShipTexture();
        this.generateBulletTexture();
        this.generateAnswerBubbleTexture();
        this.generateParticleTexture();
    }

    generateShipTexture() {
        const graphics = this.add.graphics();
        
        // Draw a more detailed spaceship
        graphics.lineStyle(2, 0x00ff00);
        graphics.fillStyle(0x00ff00, 1);
        
        // Main body
        graphics.beginPath();
        graphics.moveTo(0, -30);
        graphics.lineTo(20, 20);
        graphics.lineTo(-20, 20);
        graphics.closePath();
        graphics.fillPath();
        
        // Wings
        graphics.fillStyle(0x00aa00, 1);
        graphics.beginPath();
        graphics.moveTo(-20, 20);
        graphics.lineTo(-30, 10);
        graphics.lineTo(-20, 0);
        graphics.closePath();
        graphics.fillPath();
        
        graphics.beginPath();
        graphics.moveTo(20, 20);
        graphics.lineTo(30, 10);
        graphics.lineTo(20, 0);
        graphics.closePath();
        graphics.fillPath();
        
        // Engine glow
        graphics.fillStyle(0xff6600, 1);
        graphics.fillCircle(-10, 15, 5);
        graphics.fillCircle(10, 15, 5);
        
        graphics.generateTexture('ship', 60, 60);
        graphics.destroy();
    }

    generateBulletTexture() {
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x00ff00);
        graphics.fillStyle(0x00ff00, 1);
        
        // Draw laser bolt
        graphics.beginPath();
        graphics.moveTo(0, -8);
        graphics.lineTo(3, -4);
        graphics.lineTo(3, 4);
        graphics.lineTo(0, 8);
        graphics.lineTo(-3, 4);
        graphics.lineTo(-3, -4);
        graphics.closePath();
        
        graphics.strokePath();
        graphics.fillPath();
        
        graphics.generateTexture('bullet', 6, 16);
        graphics.destroy();
    }

    generateAnswerBubbleTexture() {
        const graphics = this.add.graphics();
        
        // Draw bubble background
        graphics.fillStyle(0x4444ff, 0.8);
        graphics.fillCircle(25, 25, 25);
        
        // Add highlight
        graphics.fillStyle(0x6666ff, 0.5);
        graphics.fillCircle(15, 15, 10);
        
        graphics.generateTexture('answerBubble', 50, 50);
        graphics.destroy();
    }

    generateParticleTexture() {
        const graphics = this.add.graphics();
        
        // Create a simple white particle
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 4);
        
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();
    }

    generateMathProblem() {
        const num1 = Phaser.Math.Between(1, 10);
        const num2 = Phaser.Math.Between(1, 10);
        const operators = ['+', '-', '*'];
        const operator = operators[Phaser.Math.Between(0, 2)];
        
        let answer;
        switch(operator) {
            case '+': answer = num1 + num2; break;
            case '-': answer = num1 - num2; break;
            case '*': answer = num1 * num2; break;
        }
        
        return {
            question: `${num1} ${operator} ${num2} = ?`,
            answer: answer
        };
    }

    generateWrongAnswer(correctAnswer) {
        let wrongAnswer;
        do {
            // Generate answer within ±5 of correct answer
            wrongAnswer = correctAnswer + Phaser.Math.Between(-5, 5);
        } while (wrongAnswer === correctAnswer || wrongAnswer < 0);
        return wrongAnswer;
    }

    spawnFallingAnswer(answer, isCorrect) {
        const x = Phaser.Math.Between(50, this.game.config.width - 50);
        const text = this.add.text(x, -30, answer.toString(), {
            fontSize: '32px',
            fill: '#ffffff'
        });
        text.setOrigin(0.5);
        
        const fallingAnswer = {
            text: text,
            speed: Phaser.Math.Between(100, 200),
            isCorrect: isCorrect
        };
        
        this.fallingAnswers.push(fallingAnswer);
    }

    create() {
        // Set up physics world
        // Removed physics world setup
        
        // Create starfield background
        this.createStarfield();
        
        // Create player ship
        this.createPlayer();
        
        // Create UI elements
        this.createUI();
        
        // Generate first math problem
        this.currentProblem = this.generateMathProblem();
        this.problemText.setText(this.currentProblem.question);
        
        // Setup keyboard input
        this.setupKeyboardInput();

        // Start spawning answers
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnAnswers,
            callbackScope: this,
            loop: true
        });
    }

    createPlayer() {
        this.playerShip = this.add.sprite(640, 600, 'ship')
            .setScale(0.8)
            .setOrigin(0.5);
        
        // Add smooth movement controls
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    createUI() {
        // Create UI container
        const uiContainer = this.add.container(0, 0);

        // Score display with background
        const scoreBg = this.add.rectangle(100, 40, 200, 50, 0x000000, 0.5)
            .setOrigin(0.5);
        this.scoreText = this.add.text(100, 40, 'Score: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        uiContainer.add([scoreBg, this.scoreText]);

        // Problem display with background
        const problemBg = this.add.rectangle(640, 50, 400, 60, 0x000000, 0.5)
            .setOrigin(0.5);
        this.problemText = this.add.text(640, 50, '', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        uiContainer.add([problemBg, this.problemText]);

        // Instructions
        const instructionText = this.add.text(640, 690, 'Use LEFT/RIGHT to move, SPACE to shoot the correct answer!', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        uiContainer.add(instructionText);
    }

    setupKeyboardInput() {
        // Space bar for shooting
        this.input.keyboard.on('keydown-SPACE', () => {
            this.shoot();
        });
    }

    shoot() {
        const currentTime = this.time.now;
        if (currentTime - this.lastShootTime >= this.shootDelay) {
            const bullet = this.add.sprite(this.playerShip.x, this.playerShip.y - 30, 'bullet')
                .setScale(1)
                .setOrigin(0.5);
            
            bullet.speed = 400; // Add bullet speed property
            this.bullets.push(bullet);
            this.lastShootTime = currentTime;

            // Create shoot effect
            const particles = this.add.particles(0, 0, 'particle', {
                speed: 100,
                scale: { start: 1, end: 0 },
                blendMode: 'ADD',
                lifespan: 200,
            });

            particles.createEmitter({
                x: this.playerShip.x,
                y: this.playerShip.y - 20,
                quantity: 5,
                speedY: { min: -100, max: -50 },
                speedX: { min: -50, max: 50 },
                scale: { start: 0.5, end: 0 },
                lifespan: 200,
            });

            // Clean up particles after animation
            this.time.delayedCall(200, () => {
                particles.destroy();
            });
        }
    }

    checkCollision(bullet, answer) {
        const dx = bullet.x - answer.text.x;
        const dy = bullet.y - answer.text.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 30; // Adjust this value for collision sensitivity
    }

    update() {
        // Update starfield
        for (const star of this.stars) {
            star.y += star.speed * this.game.loop.delta / 1000;
            
            if (star.y > this.game.config.height) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, this.game.config.width);
            }
        }

        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed * this.game.loop.delta / 1000;
            
            // Remove bullets that go off screen
            if (bullet.y < -10) {
                bullet.destroy();
                this.bullets.splice(i, 1);
                continue;
            }

            // Check collisions with falling answers
            for (let j = this.fallingAnswers.length - 1; j >= 0; j--) {
                const answer = this.fallingAnswers[j];
                if (this.checkCollision(bullet, answer)) {
                    // Handle hit
                    if (answer.isCorrect) {
                        this.score += 100;
                        this.scoreText.setText(`Score: ${this.score}`);
                        this.createSuccessEffect(answer.text.x, answer.text.y);
                        
                        // Generate new problem
                        this.currentProblem = this.generateMathProblem();
                        this.problemText.setText(this.currentProblem.question);
                        
                        // Clear all answers
                        this.clearAllAnswers();
                    } else {
                        this.score = Math.max(0, this.score - 50);
                        this.scoreText.setText(`Score: ${this.score}`);
                        this.createFailureEffect(answer.text.x, answer.text.y);
                    }
                    
                    // Remove bullet
                    bullet.destroy();
                    this.bullets.splice(i, 1);
                    
                    // Remove answer if it was correct
                    if (answer.isCorrect) {
                        answer.text.destroy();
                        this.fallingAnswers.splice(j, 1);
                    }
                    break;
                }
            }
        }

        // Update falling answers
        for (let i = this.fallingAnswers.length - 1; i >= 0; i--) {
            const answer = this.fallingAnswers[i];
            answer.text.y += answer.speed * this.game.loop.delta / 1000;
            
            // Remove answers that fall off screen
            if (answer.text.y > this.game.config.height + 30) {
                if (answer.isCorrect) {
                    // Player missed the correct answer
                    this.currentProblem = this.generateMathProblem();
                    this.problemText.setText(this.currentProblem.question);
                    // Optional: Add penalty to score
                    this.score = Math.max(0, this.score - 50);
                    this.scoreText.setText(`Score: ${this.score}`);
                }
                answer.text.destroy();
                this.fallingAnswers.splice(i, 1);
            }
        }

        // Ship movement
        const speed = 5;
        if (this.cursors.left.isDown) {
            this.playerShip.x -= speed;
        } else if (this.cursors.right.isDown) {
            this.playerShip.x += speed;
        }

        // Keep ship within bounds
        if (this.playerShip.x < 50) {
            this.playerShip.x = 50;
        }
        if (this.playerShip.x > 1230) {
            this.playerShip.x = 1230;
        }
    }

    createSuccessEffect(x, y) {
        // Create particle effect for correct hit
        const particles = this.add.particles(x, y, 'particle', {
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            gravityY: 100,
            quantity: 20,
            tint: 0x00ff00
        });

        // Clean up particles after animation
        this.time.delayedCall(500, () => {
            particles.destroy();
        });
    }

    createFailureEffect(x, y) {
        // Create particle effect for wrong hit
        const particles = this.add.particles(x, y, 'particle', {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            gravityY: 100,
            quantity: 10,
            tint: 0xff0000
        });

        // Clean up particles after animation
        this.time.delayedCall(300, () => {
            particles.destroy();
        });
    }

    clearAllAnswers() {
        this.fallingAnswers.forEach(answer => {
            answer.text.destroy();
        });
        this.fallingAnswers = [];
    }

    createStarfield() {
        // Create multiple layers of stars for parallax effect
        const numStars = 100;
        
        for (let i = 0; i < numStars; i++) {
            const x = Phaser.Math.Between(0, this.game.config.width);
            const y = Phaser.Math.Between(0, this.game.config.height);
            const size = Phaser.Math.Between(1, 3);
            const speed = Phaser.Math.Between(20, 100);
            
            const star = this.add.circle(x, y, size, 0xffffff);
            star.speed = speed;
            
            this.stars.push(star);
        }
    }

    spawnAnswers() {
        if (!this.currentProblem) return;

        // Spawn new answers periodically
        const currentTime = this.time.now;
        if (currentTime - this.lastAnswerSpawnTime > this.answerSpawnDelay) {
            if (Phaser.Math.Between(0, 3) === 0) { // 25% chance for correct answer
                this.spawnFallingAnswer(this.currentProblem.answer, true);
            } else {
                this.spawnFallingAnswer(
                    this.generateWrongAnswer(this.currentProblem.answer),
                    false
                );
            }
            this.lastAnswerSpawnTime = currentTime;
        }
    }
}
