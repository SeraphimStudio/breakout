
export default class CollectSystem {
    /**
     * @param {Phaser.Scene} scene
     * @param {Phaser.Tilemaps.TilemapLayer|null} collectLayer 
     * @param {Phaser.GameObjects.Sprite} player 
     * @param {object} [callbacks] 
     */
    constructor(scene, collectLayer, player, callbacks = {}) {
        this.scene = scene;
        this.collectLayer = collectLayer;
        this.player = player;
        this.callbacks = callbacks;

        this.starsCollected = 0;
        this.totalStars = 0;
        this.flagCaptured = false;

        this.initRegistry();

        if (this.collectLayer) {
            this.scanCollectibles();
        }
    }

    initRegistry() {
        if (!this.scene || !this.scene.registry) return;
        this.scene.registry.set("starsCollected", 0);
        this.scene.registry.set("totalStars", 0);
    }

    clearRegistry() {
        if (!this.scene || !this.scene.registry) return;
        this.scene.registry.remove("starsCollected");
        this.scene.registry.remove("totalStars");
    }

    scanCollectibles() {
        if (!this.collectLayer) return;
        this.totalStars = 0;

        this.collectLayer.forEachTile((tile) => {
            if (this.isStarTile(tile)) {
                this.totalStars++;
            }
        });

        if (this.scene && this.scene.registry) {
            this.scene.registry.set("totalStars", this.totalStars);
        }
    }

    isStarTile(tile) {
        if (!tile || tile.index <= 0) return false;
        const props = tile.properties || {};
        return (
            props.isStar === true ||
            props.isStar === "true" ||
            tile.type === "star" ||
            tile.index === 26 ||
            tile.index === 206
        );
    }

    isFlagTile(tile) {
        if (!tile || tile.index <= 0) return false;
        const props = tile.properties || {};
        return (
            props.isFlag === true ||
            props.isFlag === "true" ||
            tile.type === "flag" ||
            tile.index === 44 ||
            tile.index === 62 ||
            tile.index === 224 ||
            tile.index === 242
        );
    }

    update(time, delta) {
        if (!this.collectLayer || !this.player || !this.player.body || this.flagCaptured) return;

        const body = this.player.body;
        const tiles = this.collectLayer.getTilesWithinWorldXY(
            body.x,
            body.y,
            body.width,
            body.height
        );

        for (const tile of tiles) {
            if (!tile || tile.index <= 0) continue;

            if (this.isStarTile(tile)) {
                this.collectStar(tile);
            } else if (this.isFlagTile(tile)) {
                this.captureFlag(tile);
            }
        }
    }

    collectStar(tile) {
        const starWorldX = tile.pixelX + 8;
        const starWorldY = tile.pixelY + 8;

        this.collectLayer.removeTileAt(tile.x, tile.y);

        this.starsCollected++;
        if (this.scene && this.scene.registry) {
            this.scene.registry.set("starsCollected", this.starsCollected);
        }

        this.createFloatingText(starWorldX, starWorldY, "+1 ★", "#fbbf24");

        if (typeof this.callbacks.onStarCollect === "function") {
            this.callbacks.onStarCollect(this.starsCollected, this.totalStars);
        }
    }

    captureFlag(tile) {
        if (this.flagCaptured) return;
        this.flagCaptured = true;

        const flagWorldX = tile.pixelX + 8;
        const flagWorldY = tile.pixelY + 8;

        this.createFloatingText(flagWorldX, flagWorldY - 12, "FLAG SECURED!", "#34d399");

        if (typeof this.callbacks.onFlagCollect === "function") {
            this.callbacks.onFlagCollect();
        }
    }

    createFloatingText(x, y, text, color = "#ffffff") {
        if (!this.scene || !this.scene.add) return;

        const floatText = this.scene.add.text(x, y, text, {
            fontSize: "11px",
            fontFamily: "'Trebuchet MS', Arial, sans-serif",
            fontStyle: "bold",
            color: color
        }).setOrigin(0.5, 0.5).setDepth(200);

        floatText.setShadow(1, 1, "#000000", 2, true, true);

        this.scene.tweens.add({
            targets: floatText,
            y: y - 24,
            alpha: 0,
            scaleX: 1.25,
            scaleY: 1.25,
            duration: 850,
            ease: "Power2",
            onComplete: () => {
                if (floatText && typeof floatText.destroy === "function") {
                    floatText.destroy();
                }
            }
        });
    }

    getStarsCount() {
        return this.starsCollected;
    }

    getTotalStars() {
        return this.totalStars;
    }
}
