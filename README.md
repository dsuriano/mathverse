# MathVerse 

Blast off into mathematical adventure! MathVerse is an exciting space-themed educational game where players navigate the cosmos, solving math problems by shooting down correct answers. Built with Phaser 3, it's both fun and educational!

## Features

- Engaging space shooter gameplay with smooth controls
- Dynamic math problem generation that adapts to your skill
- Beautiful particle effects and space-themed animations
- Real-time score tracking system
- Responsive controls (LEFT/RIGHT arrows to move, SPACE to shoot)
- Stunning space-themed visuals and effects

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Local development server (like `http-server` or `live-server`)

### Running Locally

There are two ways to run the game:

#### Option 1: Direct File Access
Simply open the `index.html` file in your web browser! No server required.

#### Option 2: Using a Local Server
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mathverse.git
   cd mathverse
   ```

2. Install a local development server (if you don't have one):
   ```bash
   npm install -g http-server
   ```

3. Start the server:
   ```bash
   http-server
   ```

4. Open your browser and navigate to `http://localhost:8080`

### Play Online

You can play MathVerse online at: https://david.github.io/mathverse/

## How to Play

1. Use LEFT and RIGHT arrow keys to move your spaceship
2. Math problems appear at the top of the screen
3. Multiple answer options float in space
4. Press SPACE to shoot at the correct answer
5. Score points for correct hits, but be careful - hitting wrong answers costs points!

## Technologies Used

- Phaser 3 Game Framework
- HTML5 / CSS3
- JavaScript (ES6+)

## Project Structure

```
mathverse/
├── index.html          # Main entry point
├── js/
│   ├── game.js        # Game configuration
│   └── scenes/        # Game scenes
│       ├── MainMenu.js
│       └── Game.js
└── styles.css         # Custom styling
```

## License

MIT License - Feel free to use and modify for your own educational projects!
