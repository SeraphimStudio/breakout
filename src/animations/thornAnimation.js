export function isThornTile(tile) {
    if (!tile || tile.index <= 0) return false;
    const props = tile.properties || {};
    return (
        props.isThorn === true ||
        props.isThorn === "true" ||
        props.isThorns === true ||
        props.isThorns === "true" ||
        tile.type === "thorns" ||
        tile.type === "thorn" ||
        (tile.index >= 67 && tile.index <= 72)
    );
}

export default class ThornAnimation {
    constructor(scene, layers = []) {
        this.scene = scene;
        this.layers = Array.isArray(layers) ? layers : (layers ? [layers] : []);
        this.animatedTiles = [];
        this.frames = [];
        this.timer = 0;
        this.totalDuration = 0;
        this.currentGid = 67;

        this.init();
    }

    init() {
        this.animatedTiles = [];
        this.timer = 0;

        for (const layer of this.layers) {
            if (!layer || typeof layer.forEachTile !== "function") continue;
            layer.forEachTile((tile) => {
                if (isThornTile(tile)) {
                    this.animatedTiles.push(tile);
                }
            });
        }

        let firstgid = 1;
        let animationData = null;

        const sampleTile = this.animatedTiles[0];
        if (sampleTile && sampleTile.tileset) {
            firstgid = sampleTile.tileset.firstgid || 1;
            const tileData = sampleTile.tileset.tileData ? sampleTile.tileset.tileData[66] : null;
            if (tileData && Array.isArray(tileData.animation) && tileData.animation.length > 0) {
                animationData = tileData.animation;
            }
        }

        if (!animationData && this.scene && this.scene.map && this.scene.map.tilesets) {
            const tileset = this.scene.map.tilesets.find((ts) => ts.name === "main") || this.scene.map.tilesets[0];
            if (tileset) {
                firstgid = tileset.firstgid || 1;
                if (tileset.tileData && tileset.tileData[66] && Array.isArray(tileset.tileData[66].animation)) {
                    animationData = tileset.tileData[66].animation;
                }
            }
        }

        if (animationData && animationData.length > 0) {
            this.frames = animationData.map((f) => ({
                gid: f.tileid + firstgid,
                duration: f.duration || 100
            }));
        } else {
            this.frames = [
                { gid: 66 + firstgid, duration: 100 },
                { gid: 67 + firstgid, duration: 100 },
                { gid: 68 + firstgid, duration: 100 },
                { gid: 69 + firstgid, duration: 100 },
                { gid: 70 + firstgid, duration: 100 },
                { gid: 71 + firstgid, duration: 100 }
            ];
        }

        this.totalDuration = this.frames.reduce((sum, f) => sum + f.duration, 0);
        this.currentGid = this.frames[0].gid;
    }

    update(delta) {
        if (!this.animatedTiles || this.animatedTiles.length === 0 || !this.frames || this.frames.length === 0) {
            return;
        }

        this.timer = (this.timer + delta) % this.totalDuration;

        let accumulated = 0;
        let targetGid = this.frames[0].gid;

        for (const frame of this.frames) {
            accumulated += frame.duration;
            if (this.timer < accumulated) {
                targetGid = frame.gid;
                break;
            }
        }

        if (targetGid !== this.currentGid) {
            this.currentGid = targetGid;
            for (let i = 0; i < this.animatedTiles.length; i++) {
                const tile = this.animatedTiles[i];
                if (tile && tile.index > 0) {
                    tile.index = targetGid;
                }
            }
        }
    }

    reset() {
        this.timer = 0;
        if (this.frames && this.frames.length > 0) {
            this.currentGid = this.frames[0].gid;
            for (const tile of this.animatedTiles) {
                if (tile && tile.index > 0) {
                    tile.index = this.currentGid;
                }
            }
        }
    }
}

