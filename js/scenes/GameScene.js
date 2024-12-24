export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.level = 1;
        this.difficultyMultiplier = 1;
        this.scoreToNextLevel = 1000;
        this.consecutiveCorrect = 0;
        this.currentProblem = null;
        this.bullets = [];
        this.fallingAnswers = [];
        this.stars = [];
        this.powerUps = [];
        this.lastShootTime = 0;
        this.shootDelay = 500; // Minimum time between shots in milliseconds
        this.lastAnswerSpawnTime = 0;
        this.answerSpawnDelay = 2000; // Spawn new answer every 2 seconds
        this.activePowerUps = {
            multishot: { active: false, duration: 0 },
            slowmo: { active: false, duration: 0 },
            shield: { active: false, duration: 0 }
        };
    }

    init(data) {
        this.gameMode = data.mode;
        this.topic = data.topic || 'Addition';
        this.difficulty = 1;
        this.score = 0;
    }

    preload() {
        this.generateShipTexture();
        this.generateBulletTexture();
        this.generateAnswerBubbleTexture();
        this.generateParticleTexture();
        this.generatePowerUpTextures();
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

    generatePowerUpTextures() {
        // Multishot power-up
        const multishotGraphics = this.add.graphics();
        multishotGraphics.lineStyle(2, 0xffff00);
        multishotGraphics.fillStyle(0xffff00, 1);
        multishotGraphics.beginPath();
        multishotGraphics.moveTo(0, -10);
        multishotGraphics.lineTo(10, 10);
        multishotGraphics.lineTo(-10, 10);
        multishotGraphics.closePath();
        multishotGraphics.strokePath();
        multishotGraphics.fillPath();
        multishotGraphics.generateTexture('multishot', 20, 20);
        multishotGraphics.destroy();

        // Slow-mo power-up
        const slowmoGraphics = this.add.graphics();
        slowmoGraphics.lineStyle(2, 0x00ffff);
        slowmoGraphics.fillStyle(0x00ffff, 1);
        slowmoGraphics.beginPath();
        slowmoGraphics.arc(0, 0, 10, 0, Math.PI * 2);
        slowmoGraphics.closePath();
        slowmoGraphics.strokePath();
        slowmoGraphics.fillPath();
        slowmoGraphics.generateTexture('slowmo', 20, 20);
        slowmoGraphics.destroy();

        // Shield power-up
        const shieldGraphics = this.add.graphics();
        shieldGraphics.lineStyle(2, 0xff00ff);
        shieldGraphics.fillStyle(0xff00ff, 1);
        shieldGraphics.beginPath();
        shieldGraphics.moveTo(0, -10);
        shieldGraphics.lineTo(10, 0);
        shieldGraphics.lineTo(0, 10);
        shieldGraphics.lineTo(-10, 0);
        shieldGraphics.closePath();
        shieldGraphics.strokePath();
        shieldGraphics.fillPath();
        shieldGraphics.generateTexture('shield', 20, 20);
        shieldGraphics.destroy();
    }

    generateMathProblem() {
        let problem = '';
        let answer = 0;

        switch(this.topic) {
            case 'Addition':
                const num1 = Phaser.Math.Between(1, 20 * this.difficulty);
                const num2 = Phaser.Math.Between(1, 20 * this.difficulty);
                problem = `${num1} + ${num2} = ?`;
                answer = num1 + num2;
                break;

            case 'Subtraction':
                const minuend = Phaser.Math.Between(10, 20 * this.difficulty);
                const subtrahend = Phaser.Math.Between(1, minuend);
                problem = `${minuend} - ${subtrahend} = ?`;
                answer = minuend - subtrahend;
                break;

            case 'Multiplication':
                const factor1 = Phaser.Math.Between(1, 12);
                const factor2 = Phaser.Math.Between(1, 12);
                problem = `${factor1} × ${factor2} = ?`;
                answer = factor1 * factor2;
                break;

            case 'Division':
                const divisor = Phaser.Math.Between(1, 12);
                const quotient = Phaser.Math.Between(1, 12);
                const dividend = divisor * quotient;
                problem = `${dividend} ÷ ${divisor} = ?`;
                answer = quotient;
                break;

            case 'Fractions':
                const denom = Phaser.Math.Between(2, 12);
                const numer1 = Phaser.Math.Between(1, denom);
                const numer2 = Phaser.Math.Between(1, denom);
                problem = `${numer1}/${denom} + ${numer2}/${denom} = ?`;
                answer = numer1 + numer2;
                if (answer > denom) {
                    const whole = Math.floor(answer / denom);
                    const remainder = answer % denom;
                    answer = remainder === 0 ? whole : `${whole} ${remainder}/${denom}`;
                } else {
                    answer = `${answer}/${denom}`;
                }
                break;

            case 'Decimals':
                const decimalOps = ['add', 'subtract', 'multiply', 'divide'];
                const decimalOp = decimalOps[Phaser.Math.Between(0, decimalOps.length - 1)];
                
                if (decimalOp === 'add' || decimalOp === 'subtract') {
                    const dec1 = (Phaser.Math.Between(1, 100) / 10).toFixed(1);
                    const dec2 = (Phaser.Math.Between(1, 100) / 10).toFixed(1);
                    problem = decimalOp === 'add' ? 
                        `${dec1} + ${dec2} = ?` :
                        `${dec1} - ${dec2} = ?`;
                    answer = decimalOp === 'add' ? 
                        (parseFloat(dec1) + parseFloat(dec2)).toFixed(1) :
                        (parseFloat(dec1) - parseFloat(dec2)).toFixed(1);
                } else if (decimalOp === 'multiply') {
                    const dec1 = (Phaser.Math.Between(1, 10) / 10).toFixed(1);
                    const dec2 = Phaser.Math.Between(2, 10);
                    problem = `${dec1} × ${dec2} = ?`;
                    answer = (parseFloat(dec1) * dec2).toFixed(1);
                } else {
                    const divisor = Phaser.Math.Between(2, 5);
                    const dividend = (Phaser.Math.Between(1, 10) * divisor) / 10;
                    problem = `${dividend.toFixed(1)} ÷ ${divisor} = ?`;
                    answer = (dividend / divisor).toFixed(1);
                }
                break;

            case 'Geometry':
                const shapes = ['rectangle', 'triangle', 'circle'];
                const shape = shapes[Phaser.Math.Between(0, shapes.length - 1)];
                const geometryOps = ['area', 'perimeter'];
                const geometryOp = geometryOps[Phaser.Math.Between(0, geometryOps.length - 1)];
                
                if (shape === 'rectangle') {
                    const length = Phaser.Math.Between(3, 12);
                    const width = Phaser.Math.Between(3, 12);
                    problem = geometryOp === 'area' ?
                        `Find the area of a rectangle with length ${length} and width ${width}.` :
                        `Find the perimeter of a rectangle with length ${length} and width ${width}.`;
                    answer = geometryOp === 'area' ?
                        length * width :
                        2 * (length + width);
                } else if (shape === 'triangle') {
                    const base = Phaser.Math.Between(3, 12);
                    const height = Phaser.Math.Between(3, 12);
                    if (geometryOp === 'area') {
                        problem = `Find the area of a triangle with base ${base} and height ${height}.`;
                        answer = (base * height / 2).toFixed(1);
                    } else {
                        // Using an equilateral triangle for perimeter to keep it simple
                        problem = `Find the perimeter of an equilateral triangle with side length ${base}.`;
                        answer = base * 3;
                    }
                } else {
                    const radius = Phaser.Math.Between(2, 8);
                    problem = geometryOp === 'area' ?
                        `Find the area of a circle with radius ${radius}. (Use π = 3.14)` :
                        `Find the circumference of a circle with radius ${radius}. (Use π = 3.14)`;
                    answer = geometryOp === 'area' ?
                        (Math.PI * radius * radius).toFixed(1) :
                        (2 * Math.PI * radius).toFixed(1);
                }
                break;

            case 'Basic Algebra':
                const x = Phaser.Math.Between(1, 10);
                const b = Phaser.Math.Between(1, 20);
                problem = `x + ${b} = ${x + b}`;
                answer = x;
                break;

            case 'Advanced Algebra':
                const algebraOps = ['quadratic', 'exponential', 'logarithmic'];
                const algebraOp = algebraOps[Phaser.Math.Between(0, algebraOps.length - 1)];
                
                if (algebraOp === 'quadratic') {
                    const x = Phaser.Math.Between(-5, 5);
                    const a = Phaser.Math.Between(1, 3);
                    const c = Phaser.Math.Between(-5, 5);
                    problem = `If ${a}x² + ${c} = 0, what is one value of x?`;
                    answer = x;
                } else if (algebraOp === 'exponential') {
                    const base = Phaser.Math.Between(2, 4);
                    const exponent = Phaser.Math.Between(1, 3);
                    problem = `${base}ˣ = ${Math.pow(base, exponent)}`;
                    answer = exponent;
                } else {
                    const base = 2;
                    const x = Phaser.Math.Between(1, 4);
                    problem = `log₂(${Math.pow(2, x)}) = ?`;
                    answer = x;
                }
                break;

            case 'Trigonometry':
                const angles = [0, 30, 45, 60, 90];
                const angle = angles[Phaser.Math.Between(0, angles.length - 1)];
                const trigFunctions = ['sin', 'cos', 'tan'];
                const trigFunction = trigFunctions[Phaser.Math.Between(0, trigFunctions.length - 1)];
                
                problem = `${trigFunction}(${angle}°) = ?`;
                if (trigFunction === 'sin') {
                    answer = Math.sin(angle * Math.PI / 180).toFixed(2);
                } else if (trigFunction === 'cos') {
                    answer = Math.cos(angle * Math.PI / 180).toFixed(2);
                } else {
                    if (angle === 90) {
                        answer = 'undefined';
                    } else {
                        answer = Math.tan(angle * Math.PI / 180).toFixed(2);
                    }
                }
                break;

            case 'Probability':
                const probTypes = ['coin', 'dice', 'cards'];
                const probType = probTypes[Phaser.Math.Between(0, probTypes.length - 1)];
                
                if (probType === 'coin') {
                    const flips = Phaser.Math.Between(2, 4);
                    problem = `Probability of getting all heads in ${flips} coin flips = ?`;
                    answer = `1/${Math.pow(2, flips)}`;
                } else if (probType === 'dice') {
                    problem = 'Probability of rolling a 6 on a fair die = ?';
                    answer = '1/6';
                } else {
                    problem = 'Probability of drawing a heart from a standard deck = ?';
                    answer = '13/52';
                }
                break;

            case 'Statistics':
                const numbers = Array.from({length: 5}, () => Phaser.Math.Between(1, 20));
                const statTypes = ['mean', 'median', 'mode'];
                const statType = statTypes[Phaser.Math.Between(0, statTypes.length - 1)];
                
                problem = `Find the ${statType} of: ${numbers.join(', ')}`;
                if (statType === 'mean') {
                    answer = (numbers.reduce((a, b) => a + b) / numbers.length).toFixed(1);
                } else if (statType === 'median') {
                    const sorted = numbers.sort((a, b) => a - b);
                    answer = sorted[Math.floor(sorted.length / 2)];
                } else {
                    const mode = numbers.reduce((a, b) => (a[b] = (a[b] || 0) + 1, a), {});
                    answer = Object.entries(mode).reduce((a, b) => mode[a] > mode[b] ? a : b);
                }
                break;

            default:
                // Default to addition if topic not implemented
                const defaultNum1 = Phaser.Math.Between(1, 10);
                const defaultNum2 = Phaser.Math.Between(1, 10);
                problem = `${defaultNum1} + ${defaultNum2} = ?`;
                answer = defaultNum1 + defaultNum2;
        }

        return {
            question: problem,
            answer: answer
        };
    }

    generateWrongAnswer(correctAnswer) {
        let wrongAnswer;
        const isNumeric = typeof correctAnswer === 'number';
        
        if (isNumeric) {
            do {
                // Generate answer within ±5 of correct answer
                wrongAnswer = correctAnswer + Phaser.Math.Between(-5, 5);
            } while (wrongAnswer === correctAnswer || wrongAnswer < 0);
        } else {
            // Handle fraction answers
            const fractionParts = correctAnswer.toString().split(' ');
            if (fractionParts.length > 1) {
                // Mixed number
                const whole = parseInt(fractionParts[0]);
                const fraction = fractionParts[1];
                wrongAnswer = `${whole + Phaser.Math.Between(-1, 1)} ${fraction}`;
            } else {
                // Simple fraction
                const [numer, denom] = correctAnswer.split('/').map(n => parseInt(n));
                wrongAnswer = `${numer + Phaser.Math.Between(-2, 2)}/${denom}`;
            }
        }
        
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

    spawnPowerUp() {
        const powerUpTypes = ['multishot', 'slowmo', 'shield'];
        const type = powerUpTypes[Phaser.Math.Between(0, powerUpTypes.length - 1)];
        const x = Phaser.Math.Between(50, this.game.config.width - 50);
        
        const powerUp = this.add.sprite(x, -20, type);
        powerUp.type = type;
        powerUp.speed = Phaser.Math.Between(50, 100);
        
        // Add glow effect
        const particles = this.add.particles(x, -20, 'particle', {
            speed: { min: 20, max: 40 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.2, end: 0 },
            lifespan: 1000,
            quantity: 1,
            frequency: 50,
            tint: type === 'multishot' ? 0xffff00 : type === 'slowmo' ? 0x00ffff : 0xff00ff
        });
        
        powerUp.particles = particles;
        this.powerUps.push(powerUp);
    }

    activatePowerUp(type) {
        const duration = 10000; // 10 seconds
        this.activePowerUps[type].active = true;
        this.activePowerUps[type].duration = duration;
        
        // Visual feedback
        const text = type.charAt(0).toUpperCase() + type.slice(1);
        const powerUpText = this.add.text(640, 200, `${text} Activated!`, {
            fontSize: '32px',
            fill: type === 'multishot' ? '#ffff00' : type === 'slowmo' ? '#00ffff' : '#ff00ff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: powerUpText,
            y: 150,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => powerUpText.destroy()
        });
        
        // Create power-up icon
        const icon = this.add.sprite(50 + Object.keys(this.activePowerUps).indexOf(type) * 40, 150, type)
            .setScale(1.5);
        
        // Add timer bar under icon
        const timerBar = this.add.rectangle(icon.x, icon.y + 20, 30, 4, 0xffffff);
        const timerMask = this.add.rectangle(icon.x, icon.y + 20, 30, 4, 0xffffff);
        timerBar.mask = new Phaser.Display.Masks.GeometryMask(this, timerMask);
        
        // Animate timer bar
        this.tweens.add({
            targets: timerMask,
            scaleX: 0,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                icon.destroy();
                timerBar.destroy();
                timerMask.destroy();
            }
        });
    }

    create() {
        // Create starfield background
        this.createStarfield();
        
        // Create player ship
        this.playerShip = this.add.sprite(640, 650, 'ship')
            .setScale(0.8)
            .setOrigin(0.5);
        
        // Setup keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Setup space key for shooting
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Display current problem
        this.problemText = this.add.text(640, 50, '', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Generate first problem
        this.currentProblem = this.generateMathProblem();
        this.problemText.setText(this.currentProblem.question);
        
        // Display score and level
        this.scoreText = this.add.text(50, 30, 'Score: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        this.levelText = this.add.text(50, 70, 'Level: 1', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });

        this.nextLevelText = this.add.text(50, 110, 'Next Level: 1000', {
            fontSize: '20px',
            fill: '#88ff88',
            fontFamily: 'Arial'
        });

        // Add menu button
        const menuButton = this.add.rectangle(1180, 50, 150, 40, 0x4444ff, 0.8)
            .setInteractive()
            .on('pointerover', () => menuButton.setFillStyle(0x6666ff, 0.8))
            .on('pointerout', () => menuButton.setFillStyle(0x4444ff, 0.8))
            .on('pointerdown', () => this.returnToMenu());

        this.add.text(1180, 50, 'Menu', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Add ESC key handler
        this.input.keyboard.on('keydown-ESC', () => this.returnToMenu());

        // Add instructions text
        this.add.text(640, 700, 'Use LEFT/RIGHT to move, SPACE to shoot, ESC for menu', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Start spawning answers
        this.time.addEvent({
            delay: 2000,
            callback: () => this.spawnAnswers(),
            loop: true
        });
    }

    returnToMenu() {
        // Clean up any running timers or events
        this.clearAllAnswers();
        
        // Return to the main menu
        this.scene.start('MainMenuScene');
    }

    createPlayer() {
        // Add smooth movement controls
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
            if (this.activePowerUps.multishot.active) {
                // Shoot 3 bullets in a spread pattern
                for (let i = -1; i <= 1; i++) {
                    const bullet = this.add.sprite(this.playerShip.x + (i * 20), this.playerShip.y - 30, 'bullet')
                        .setScale(1)
                        .setOrigin(0.5);
                    bullet.speed = 400;
                    this.bullets.push(bullet);
                }
            } else {
                const bullet = this.add.sprite(this.playerShip.x, this.playerShip.y - 30, 'bullet')
                    .setScale(1)
                    .setOrigin(0.5);
                bullet.speed = 400;
                this.bullets.push(bullet);
            }
            
            this.lastShootTime = currentTime;

            const particles = this.add.particles(this.playerShip.x, this.playerShip.y - 20, 'particle', {
                speed: { min: 50, max: 100 },
                angle: { min: 260, max: 280 },
                scale: { start: 0.5, end: 0 },
                lifespan: 200,
                quantity: 5,
                tint: 0x00ff00
            });

            this.time.delayedCall(200, () => {
                particles.destroy();
            });

            this.cameras.main.shake(50, 0.002);
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

        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            const speedMultiplier = this.activePowerUps.slowmo.active ? 0.5 : 1;
            powerUp.y += powerUp.speed * speedMultiplier * this.game.loop.delta / 1000;
            powerUp.particles.setPosition(powerUp.x, powerUp.y);
            
            if (powerUp.y > this.game.config.height + 20) {
                powerUp.particles.destroy();
                powerUp.destroy();
                this.powerUps.splice(i, 1);
                continue;
            }
            
            // Check collision with player
            const dx = this.playerShip.x - powerUp.x;
            const dy = this.playerShip.y - powerUp.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 40) {
                this.activatePowerUp(powerUp.type);
                powerUp.particles.destroy();
                powerUp.destroy();
                this.powerUps.splice(i, 1);
            }
        }
        
        // Update power-up durations
        for (const [type, powerUp] of Object.entries(this.activePowerUps)) {
            if (powerUp.active) {
                powerUp.duration -= this.game.loop.delta;
                if (powerUp.duration <= 0) {
                    powerUp.active = false;
                }
            }
        }

        // Handle shooting
        if (this.spaceKey.isDown) {
            this.shoot();
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
                        this.consecutiveCorrect++;
                        const baseScore = 100;
                        const bonusMultiplier = Math.min(2, 1 + (this.consecutiveCorrect * 0.1));
                        const levelBonus = Math.floor(baseScore * (this.level * 0.1));
                        const totalScore = Math.floor((baseScore + levelBonus) * bonusMultiplier);
                        
                        this.score += totalScore;
                        this.scoreText.setText(`Score: ${this.score}`);
                        
                        // Check for level up
                        if (this.score >= this.scoreToNextLevel) {
                            this.levelUp();
                        }
                        
                        this.createSuccessEffect(answer.text.x, answer.text.y);
                        this.currentProblem = this.generateMathProblem();
                        this.problemText.setText(this.currentProblem.question);
                        this.clearAllAnswers();
                        
                        // Update next level progress
                        this.nextLevelText.setText(`Next Level: ${this.scoreToNextLevel - this.score}`);
                    } else {
                        this.consecutiveCorrect = 0;
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

        // Update falling answers with difficulty-based speed
        for (let i = this.fallingAnswers.length - 1; i >= 0; i--) {
            const answer = this.fallingAnswers[i];
            const speedMultiplier = 1 + (this.level * 0.1);
            answer.text.y += (answer.speed * speedMultiplier) * this.game.loop.delta / 1000;
            
            // Remove answers that fall off screen
            if (answer.text.y > this.game.config.height + 30) {
                if (answer.isCorrect) {
                    this.consecutiveCorrect = 0;
                    this.currentProblem = this.generateMathProblem();
                    this.problemText.setText(this.currentProblem.question);
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

        // Spawn power-ups occasionally
        if (Phaser.Math.Between(0, 1000) < 5) { // 0.5% chance per frame
            this.spawnPowerUp();
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

    levelUp() {
        this.level++;
        this.levelText.setText(`Level: ${this.level}`);
        this.scoreToNextLevel = this.scoreToNextLevel + (1000 * this.level);
        this.nextLevelText.setText(`Next Level: ${this.scoreToNextLevel - this.score}`);
        
        // Visual feedback for level up
        this.cameras.main.flash(500, 0, 255, 0);
        this.cameras.main.shake(500, 0.005);
        
        // Create level up text animation
        const levelUpText = this.add.text(640, 360, 'LEVEL UP!', {
            fontSize: '64px',
            fill: '#00ff00',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: levelUpText,
            y: 260,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => levelUpText.destroy()
        });
        
        // Adjust game difficulty
        this.difficultyMultiplier = 1 + (this.level * 0.1);
        this.answerSpawnDelay = Math.max(1000, 2000 - (this.level * 100));
    }
}
