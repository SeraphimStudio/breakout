import Phaser from "phaser";
import createPlayerAnimations from "../animations/player";
import createEnemyAnims from "../animations/enemies";

export default class MainMenu extends Phaser.Scene {

    constructor() {
        super("mainmenu");
        this.playButton = null;
    }
    preload() {
        this.load.tilemapTiledJSON("map", "assets/Tilemaps/map.tmj");
        this.load.image("tiles", "assets/Tilemaps/main.png");
        this.load.spritesheet("enemy1_idle", "assets/char/1/Idle.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("player1_idle", "assets/char/2/Idle.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy2_idle", "assets/char/3/Idle.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy3_idle", "assets/char/6/Idle.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy4_idle", "assets/char/11/Idle.png", { frameWidth: 48, frameHeight: 48 });

        this.load.spritesheet("enemy1_walk", "assets/char/1/Walk.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("player1_walk", "assets/char/2/Walk.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy2_walk", "assets/char/3/Walk.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy3_walk", "assets/char/6/Walk.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy4_walk", "assets/char/11/Walk.png", { frameWidth: 48, frameHeight: 48 });

        this.load.spritesheet("enemy1_special", "assets/char/1/Special.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("player1_special", "assets/char/2/Special.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy2_special", "assets/char/3/Special.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy3_special", "assets/char/6/Special.png", { frameWidth: 48, frameHeight: 48 });
    }
    create() {
        createPlayerAnimations(this.anims);
        createEnemyAnims(this.anims);
        this.scene.start("GameScene");
    }

}
