import Phaser from "phaser";
import Enemy from "../systems/enemy";

export default class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene");
    }

    create() {
        this.map = this.make.tilemap({ key: "map" });
        const tileset = this.map.addTilesetImage("main", "tiles");

        this.bg = this.map.createLayer("bg", tileset, 0, 0);
        this.groundLayer = this.map.createLayer("ground", tileset, 0, 0);
        this.objectLayer = this.map.createLayer("objects", tileset, 0, 0);
        this.enemypath = this.map.getObjectLayer("enemy_path") || this.map.getObjectLayer("ememy_path");

        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;

        this.groundLayer.setCollisionFromCollisionGroup();

        this.player = this.physics.add.sprite(100, 30, "player1_idle", 0);
        this.player.setCollideWorldBounds(true);
        this.player.play("player_idle", true);
        this.player.setOrigin(0, 0);
        this.player.setDepth(10);
        this.player.setScale(0.75);
        this.player.setBodySize(20, 40);
        this.player.refreshBody();

        this.physics.add.collider(this.player, this.groundLayer);

        this.enemy = new Enemy(this, 64, 20, "enemy2_idle");
        this.physics.add.collider(this.enemy.body, this.groundLayer);

        const cam = this.cameras.main;
        cam.setZoom(1);
        cam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        cam.startFollow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(time, delta) {
        const px = this.player.body.center.x;
        const py = this.player.body.center.y;
        const pFeet = this.player.body.bottom - 2;
        const pHead = this.player.body.top + 2;

        const tile = this.objectLayer.getTileAtWorldXY(px, py) ||
            this.objectLayer.getTileAtWorldXY(px, pFeet) ||
            this.objectLayer.getTileAtWorldXY(px, pHead) ||
            this.groundLayer.getTileAtWorldXY(px, py) ||
            this.groundLayer.getTileAtWorldXY(px, pFeet);

        const onLadder = Boolean(tile && (
            tile.properties?.isLadder === true ||
            tile.properties?.isLadder === "true" ||
            [58, 59, 60].includes(tile.index)
        ));

        if (onLadder) {
            this.player.body.allowGravity = false;
            if (this.cursors.up.isDown) {
                this.player.setVelocityY(-120);
            } else if (this.cursors.down.isDown) {
                this.player.setVelocityY(120);
            } else {
                this.player.setVelocityY(0);
            }
        } else {
            this.player.body.allowGravity = true;
            if (this.cursors.up.isDown && this.player.body.blocked.down) {
                this.player.setVelocityY(-150);
            }
        }
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


        if (this.enemy) {
            this.enemy.move(time, delta);
        }
    }
}
