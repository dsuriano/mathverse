import MainMenuScene from './scenes/MainMenuScene.js';
import GameScene from './scenes/GameScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#000033',
    parent: 'game-container',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0.5 },
            debug: false
        }
    },
    scene: [MainMenuScene, LevelSelectScene, GameScene]
};

const game = new Phaser.Game(config);
