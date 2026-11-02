import Phaser from "phaser";
import BootScene from "./scenes/boot";
import GameScene from "./scenes/game";
import MainMenu from "./scenes/mainmenu";
import LevelScene from "./scenes/level";

const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 270,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true,
    scene: [
        BootScene,
        MainMenu,
        LevelScene,
        GameScene
    ]
};

export default config;