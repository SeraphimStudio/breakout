import Phaser from "phaser";
import {
    isSegmentHorizontal,
    hasArrivedAtNode,
    dijkstra,
    getClosestNode,
    checkDirectChase,
    getBestNextNode
} from "../utils/math";

export const waypoints = {
    A: { x: 64, y: 32, connections: ["B"] },
    B: { x: 311, y: 32, connections: ["A", "C"] },
    C: { x: 311, y: 80, connections: ["B", "D", "F"] },
    D: { x: 880, y: 80, connections: ["C"] },
    E: { x: 64, y: 192, connections: ["F"] },
    F: { x: 312, y: 192, connections: ["C", "E", "G"] },
    G: { x: 312, y: 256, connections: ["F", "H"] },
    H: { x: 729, y: 256, connections: ["G", "I"] },
    I: { x: 729, y: 320, connections: ["H", "J", "K"] },
    J: { x: 1328, y: 320, connections: ["I"] },
    K: { x: 729, y: 432, connections: ["I", "L"] },
    L: { x: 1408, y: 432, connections: ["K"] }
};

// Continuous platform corridors and vertical shafts
const CORRIDORS = [
    // 6 horizontal platforms
    { type: "horizontal", y: 32, minX: 64, maxX: 311 },
    { type: "horizontal", y: 80, minX: 311, maxX: 880 },
    { type: "horizontal", y: 192, minX: 64, maxX: 312 },
    { type: "horizontal", y: 256, minX: 312, maxX: 729 },
    { type: "horizontal", y: 320, minX: 729, maxX: 1328 },
    { type: "horizontal", y: 432, minX: 729, maxX: 1408 },
    // 2 vertical shafts for climbing
    { type: "vertical", x: 311, minY: 32, maxY: 256 },
    { type: "vertical", x: 729, minY: 256, maxY: 432 }
];

export default class Enemy {
    constructor(scene, x, y, sprite = "enemy2_idle") {
        this.scene = scene;
        this.waypoints = waypoints;

        const startX = x !== undefined ? x : waypoints.A.x;
        const startY = y !== undefined ? y : waypoints.A.y;

        this.body = scene.physics.add.sprite(startX, startY, sprite, 0);
        this.body.setCollideWorldBounds(true);
        this.body.setOrigin(0, 0);
        this.body.setScale(0.75);
        this.body.setBodySize(24, 40);
        this.body.refreshBody();
        this.sprite = this.body;

        this.speed = 80;
        this.climbSpeed = 130;
        this.currentNode = "A";
        this.targetNode = null;
        this.isClimbing = false;
    }

    isLadderTile(x, y) {
        if (!this.scene) return false;
        const tile = (this.scene.objectLayer && this.scene.objectLayer.getTileAtWorldXY(x, y)) ||
            (this.scene.groundLayer && this.scene.groundLayer.getTileAtWorldXY(x, y));
        return Boolean(tile && (
            tile.properties?.isLadder === true ||
            tile.properties?.isLadder === "true" ||
            [58, 59, 60].includes(tile.index)
        ));
    }

    isInLadderRegion() {
        if (!this.body || !this.body.body) return false;
        const body = this.body.body;
        const cx = body.center.x;
        const cy = body.center.y;
        const feet = body.bottom - 2;
        const head = body.top + 2;

        if (this.isLadderTile(cx, cy) ||
            this.isLadderTile(cx, feet) ||
            this.isLadderTile(cx, head)) {
            return true;
        }

        // Shaft 1 is at x: 288..336, Shaft 2 is at x: 704..752
        const inShaft1 = cx >= 288 && cx <= 336 && cy >= 32 && cy <= 288;
        const inShaft2 = cx >= 704 && cx <= 752 && cy >= 256 && cy <= 464;
        return inShaft1 || inShaft2;
    }

    move(time, delta) {
        const player = this.scene.player;
        if (!player || !player.body || !this.body || !this.body.body) return;

        const eX = this.body.body.center.x;
        const eY = this.body.body.center.y;
        const originY = this.body.y;
        const pX = player.body.center.x;
        const pY = player.body.center.y;
        const pOriginY = player.y;

        const inLadder = this.isInLadderRegion();

        // While actively climbing a ladder, do not interrupt with horizontal direct chase
        const isClimbingLadder = this.isClimbing ||
            (this.targetNode && !isSegmentHorizontal(this.currentNode, this.targetNode, this.waypoints));

        // 1. Direct Chase: when player and enemy share horizontal or vertical coordinates of a corridor
        let directChase = null;
        if (!isClimbingLadder) {
            directChase = checkDirectChase(eX, eY, pX, pY, CORRIDORS);
        } else {
            const chase = checkDirectChase(eX, eY, pX, pY, CORRIDORS);
            if (chase && chase.type === "vertical") {
                directChase = chase;
            }
        }

        if (directChase) {
            this.targetNode = null;
            this.isClimbing = false;

            if (directChase.type === "horizontal") {
                // If in ladder region, hold vertical position; once out, fall to ground by gravity
                if (inLadder) {
                    this.body.body.allowGravity = false;
                    this.body.setVelocityY(0);
                } else {
                    this.body.body.allowGravity = true;
                }

                const dx = pX - eX;
                if (Math.abs(dx) > 6) {
                    this.body.setVelocityX(Math.sign(dx) * this.speed);
                    this.body.setFlipX(dx < 0);
                    this.body.play("enemy2_run", true);
                } else {
                    this.body.setVelocityX(0);
                    this.body.play("enemy2_idle", true);
                }
            } else if (directChase.type === "vertical") {
                this.body.body.allowGravity = false;
                const shaftCenterX = directChase.targetX;
                const currentCenterX = this.body.body.center.x;
                if (Math.abs(currentCenterX - shaftCenterX) > 2) {
                    this.body.setVelocityX(Math.sign(shaftCenterX - currentCenterX) * 40);
                } else {
                    this.body.setVelocityX(0);
                }

                const targetY = (pY < eY) ? (pY - 12) : pY;
                const dy = targetY - eY;
                if (Math.abs(dy) > 4) {
                    this.body.setVelocityY(Math.sign(dy) * this.climbSpeed);
                    this.body.play("enemy2_run", true);
                } else {
                    this.body.setVelocityY(0);
                    this.body.play("enemy2_idle", true);
                }
            }
            return;
        }

        // 2. Shortest Path Graph Traversal: route towards player's nearest node
        const playerTargetNode = getClosestNode(pX, pOriginY, this.waypoints);
        if (!playerTargetNode) return;

        // Check if reached current targetNode
        if (this.targetNode) {
            if (hasArrivedAtNode(this, this.currentNode, this.targetNode, this.waypoints)) {
                this.currentNode = this.targetNode;
                this.isClimbing = false;
                if (this.targetNode === playerTargetNode) {
                    this.targetNode = null;
                } else {
                    const { path } = dijkstra(this.currentNode, playerTargetNode, this.waypoints);
                    this.targetNode = (path && path.length > 1) ? path[1] : null;
                }
            }
        }

        if (!this.targetNode) {
            const next = getBestNextNode(eX, originY, playerTargetNode, this.waypoints);
            this.currentNode = next.fromNode || this.currentNode;
            this.targetNode = next.targetNode;
        }

        if (!this.targetNode) {
            this.body.setVelocity(0, 0);
            this.body.play("enemy2_idle", true);
            return;
        }

        const wp = this.waypoints[this.targetNode];
        const isVerticalMove = !isSegmentHorizontal(this.currentNode, this.targetNode, this.waypoints);

        if (isVerticalMove) {
            // Climbing ladder
            this.isClimbing = true;
            this.body.body.allowGravity = false;

            const shaftCenterX = wp.x;
            const currentCenterX = this.body.body.center.x;
            if (Math.abs(currentCenterX - shaftCenterX) > 2) {
                this.body.setVelocityX(Math.sign(shaftCenterX - currentCenterX) * 40);
            } else {
                this.body.setVelocityX(0);
            }

            const fromY = this.waypoints[this.currentNode] ? this.waypoints[this.currentNode].y : wp.y;
            const movingUp = wp.y < fromY;

            if (movingUp) {
                this.body.setVelocityY(-this.climbSpeed);
            } else {
                this.body.setVelocityY(this.climbSpeed);
            }
            this.body.play("enemy2_run", true);
        } else {
            // Walking forward horizontally along platform
            this.isClimbing = false;

            if (inLadder) {
                // In ladder region, hold vertical velocity so enemy doesn't fall down the ladder opening
                this.body.body.allowGravity = false;
                this.body.setVelocityY(0);
            } else {
                // When out of ladder region, fall to ground by gravity
                this.body.body.allowGravity = true;
            }

            const dx = wp.x - eX;
            if (Math.abs(dx) > 4) {
                this.body.setVelocityX(Math.sign(dx) * this.speed);
                this.body.setFlipX(dx < 0);
                this.body.play("enemy2_run", true);
            } else {
                this.body.setVelocityX(0);
                this.body.play("enemy2_idle", true);
            }
        }
    }
}
