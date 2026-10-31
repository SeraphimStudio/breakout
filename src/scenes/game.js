import Phaser from "phaser";
export default class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene");
    }


    create() {
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage("main", "tiles");

        const bg = map.createLayer("bg", tileset, 0, 0);
        const groundLayer = map.createLayer("ground", tileset, 0, 0);
        const itemLayer = map.createLayer("objects", tileset, 0, 0);
        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;

        groundLayer.setCollisionFromCollisionGroup();

        this.player = this.physics.add.sprite(100, 30, "player1_idle", 0);
        this.player.setCollideWorldBounds(true);
        this.player.play("player_idle", true);
        this.player.setOrigin(0, 0);
        this.player.setDepth(10);
        this.player.setScale(0.75);
        this.player.setBodySize(20, 40);
        this.player.refreshBody();

        this.physics.add.collider(this.player, groundLayer);

        const cam = this.cameras.main;
        cam.setZoom(1);
        cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        cam.startFollow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();

    }
    update(time, delta) {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-100);
            this.player.play("player_run", true);
            this.player.setFlipX(true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(100);
            this.player.play("player_run", true);
            this.player.setFlipX(false);
        }
        else {
            this.player.setVelocityX(0);
            this.player.play("player_idle", true);
        }

        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-150);
        }

    }
}
