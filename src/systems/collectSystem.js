/**
 * CollectSystem - Manages collectible items (stars, flags) on the tilemap's "collect" layer.
 * Tracks star counts, manages Phaser registry state, and handles collision/collection logic.
 */
export default class CollectSystem {
    /**
     * @param {Phaser.Scene} scene - The active Phaser game scene.
     * @param {Phaser.Tilemaps.TilemapLayer|null} collectLayer - Tilemap layer containing collectibles.
     * @param {Phaser.GameObjects.Sprite} player - The player sprite.
     * @param {object} [callbacks] - Event callbacks: { onStarCollect, onFlagCollect }.
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

    /**
     * Initializes temporary star counters in the Phaser registry.
     */
    initRegistry() {
        if (!this.scene || !this.scene.registry) return;
        this.scene.registry.set("starsCollected", 0);
        this.scene.registry.set("totalStars", 0);
    }

    /**
     * Clears temporary star data from the Phaser registry after win/lose.
     */
    clearRegistry() {
        if (!this.scene || !this.scene.registry) return;
        this.scene.registry.remove("starsCollected");
        this.scene.registry.remove("totalStars");
    }

    /**
     * Scans the collect layer to identify total stars.
     */
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

    /**
     * Determines whether a tile represents a star.
     * @param {Phaser.Tilemaps.Tile} tile
     * @returns {boolean}
     */
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

    /**
     * Determines whether a tile represents a flag.
     * @param {Phaser.Tilemaps.Tile} tile
     * @returns {boolean}
     */
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

    /**
     * Checks for player overlap with collectibles during scene update.
     */
    update(time, delta) {
        if (!this.collectLayer || !this.player || !this.player.body || this.flagCaptured) return;

        const body = this.player.body;
        // Retrieve any non-empty tiles intersecting the player's bounding box
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

    /**
     * Handles picking up a star tile.
     * @param {Phaser.Tilemaps.Tile} tile
     */
    collectStar(tile) {
        const starWorldX = tile.pixelX + 8;
        const starWorldY = tile.pixelY + 8;

        // Remove the tile from the layer
        this.collectLayer.removeTileAt(tile.x, tile.y);

        this.starsCollected++;
        if (this.scene && this.scene.registry) {
            this.scene.registry.set("starsCollected", this.starsCollected);
        }

        // Floating pickup feedback text (+1 ★)
        this.createFloatingText(starWorldX, starWorldY, "+1 ★", "#fbbf24");

        if (typeof this.callbacks.onStarCollect === "function") {
            this.callbacks.onStarCollect(this.starsCollected, this.totalStars);
        }
    }

    /**
     * Handles capturing the flag (level win condition).
     * @param {Phaser.Tilemaps.Tile} tile
     */
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

    /**
     * Spawns an animated floating text popup.
     */
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
