import Phaser from "phaser";
import GameScene from "./scenes/game";
import MainMenu from "./scenes/mainmenu";

const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 270,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: true
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true,
    scene: [
        MainMenu,
        GameScene
    ]
};

export default config