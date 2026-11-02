import ThornAnimation, { isThornTile } from "../animations/thornAnimation.js";


export default class ObstacleSystem {
    constructor(scene, obstacleLayer, player, callbacks = {}, groundLayer = null) {
        this.scene = scene;
        this.obstacleLayer = obstacleLayer;
        this.player = player;
        this.callbacks = callbacks;
        this.groundLayer = groundLayer;
        this.isTriggered = false;

        this.init();
    }

    init() {
        if (this.groundLayer) {
            this.groundLayer.forEachTile((tile) => {
                if (this.isThornTile(tile)) {
                    tile.setCollision(false, false, false, false);
                }
            });
        }

        if (this.obstacleLayer) {
            this.obstacleLayer.forEachTile((tile) => {
                if (this.isThornTile(tile)) {
                    tile.setCollision(false, false, false, false);
                }
            });

            if (this.scene.physics && this.scene.physics.add && this.player) {
                this.scene.physics.add.overlap(
                    this.player,
                    this.obstacleLayer,
                    (player, tile) => {
                        this.handleTileContact(tile);
                    },
                    (player, tile) => {
                        return this.isThornTile(tile);
                    },
                    this
                );
            }
        }

        const animLayers = [this.obstacleLayer, this.groundLayer].filter(Boolean);
        this.thornAnimation = new ThornAnimation(this.scene, animLayers);
    }

    isThornTile(tile) {
        return isThornTile(tile);
    }

    checkThornIntersection(body, tile) {
        if (!body || !tile) return false;

        const bodyLeft = body.left !== undefined ? body.left : body.x;
        const bodyRight = body.right !== undefined ? body.right : body.x + (body.width || 0);
        const bodyTop = body.top !== undefined ? body.top : body.y;
        const bodyBottom = body.bottom !== undefined ? body.bottom : body.y + (body.height || 0);

        const tileData = tile.tileset ? tile.tileset.getTileData(tile.index) : null;
        const collisionObjects = tileData && tileData.objectgroup && tileData.objectgroup.objects;

        if (Array.isArray(collisionObjects) && collisionObjects.length > 0) {
            for (const obj of collisionObjects) {
                const objLeft = tile.pixelX + (obj.x || 0);
                const objTop = tile.pixelY + (obj.y || 0);
                const objWidth = obj.width || 16;
                const objHeight = obj.height || 16;
                const objRight = objLeft + objWidth;
                const objBottom = objTop + objHeight;

                if (
                    bodyRight > objLeft &&
                    bodyLeft < objRight &&
                    bodyBottom > objTop &&
                    bodyTop < objBottom
                ) {
                    return true;
                }
            }
            return false;
        }

        const thornLeft = tile.pixelX;
        const thornRight = tile.pixelX + 16;
        const thornTop = tile.pixelY + 8;
        const thornBottom = tile.pixelY + 16;

        return (
            bodyRight > thornLeft &&
            bodyLeft < thornRight &&
            bodyBottom > thornTop &&
            bodyTop < thornBottom
        );
    }

    handleTileContact(tile) {
        if (this.isTriggered || !this.player || !this.player.body) return;

        if (this.checkThornIntersection(this.player.body, tile)) {
            this.triggerDefeat(tile);
        }
    }

    triggerDefeat(tile) {
        if (this.isTriggered) return;
        this.isTriggered = true;

        const tileWorldX = tile ? tile.pixelX + 8 : this.player.x;
        const tileWorldY = tile ? tile.pixelY + 8 : this.player.y;

        this.createFloatingText(tileWorldX, tileWorldY - 6, "HAZARD!", "#ef4444");

        if (typeof this.callbacks.onPlayerHitObstacle === "function") {
            this.callbacks.onPlayerHitObstacle(tile);
        } else if (this.scene && typeof this.scene.handleLose === "function") {
            this.scene.handleLose("thorns");
        }
    }

    update(time, delta) {
        if (this.thornAnimation && delta) {
            this.thornAnimation.update(delta);
        }

        if (!this.player || !this.player.body || this.isTriggered) return;

        const body = this.player.body;

        if (this.obstacleLayer) {
            const tiles = this.obstacleLayer.getTilesWithinWorldXY(
                body.x,
                body.y,
                body.width,
                body.height
            );

            for (const tile of tiles) {
                if (this.isThornTile(tile) && this.checkThornIntersection(body, tile)) {
                    this.triggerDefeat(tile);
                    return;
                }
            }
        }

        if (this.groundLayer) {
            const tiles = this.groundLayer.getTilesWithinWorldXY(
                body.x,
                body.y,
                body.width,
                body.height
            );

            for (const tile of tiles) {
                if (this.isThornTile(tile) && this.checkThornIntersection(body, tile)) {
                    this.triggerDefeat(tile);
                    return;
                }
            }
        }
    }

    createFloatingText(x, y, text, color = "#ef4444") {
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
    reset() {
        this.isTriggered = false;
        if (this.thornAnimation) {
            this.thornAnimation.reset();
        }
    }
}
