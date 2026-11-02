import Phaser from "phaser";
import {
    isSegmentHorizontal,
    hasArrivedAtNode,
    dijkstra,
    getClosestNode,
    checkDirectChase,
    getBestNextNode
} from "../utils/math";
import { waypoints, CORRIDORS } from "../data/level1";


export default class Enemy {
    constructor(scene, x, y, sprite = "enemy1_idle", customWaypoints = null, customCorridors = null) {
        this.scene = scene;
        this.waypoints = customWaypoints || scene.waypoints || waypoints;
        this.corridors = customCorridors || scene.corridors || CORRIDORS;

        let enemyPrefix = "enemy1";
        if (typeof sprite === "object" && sprite?.key) {
            enemyPrefix = sprite.key.split("_")[0];
        } else if (typeof sprite === "string") {
            enemyPrefix = sprite.split("_")[0];
        }
        this.enemyKey = enemyPrefix;
        this.idleAnim = `${enemyPrefix}_idle`;
        this.runAnim = `${enemyPrefix}_run`;
        const initialSprite = (typeof sprite === "string" && sprite.includes("_")) ? sprite : this.idleAnim;

        const startX = x !== undefined ? x : this.waypoints.A.x;
        const startY = y !== undefined ? y : this.waypoints.A.y;

        this.body = scene.physics.add.sprite(startX, startY, initialSprite, 0);
        this.body.setCollideWorldBounds(true);
        this.body.setOrigin(0, 0);
        this.body.setScale(0.75);
        this.body.setBodySize(24, 40);
        this.body.refreshBody();
        this.sprite = this.body;
        this.body.play(this.idleAnim, true);

        this.speed = 80;
        this.climbSpeed = 130;
        this.currentNode = "A";
        this.targetNode = null;
        this.isClimbing = false;
    }

    isLadderTile(x, y) {
        if (!this.scene) return false;
        if (this.scene.isLadderAt) {
            return this.scene.isLadderAt(x, y);
        }

        const objTile = this.scene.objectLayer ? this.scene.objectLayer.getTileAtWorldXY(x, y) : null;
        if (objTile && objTile.index > 0 && (
            objTile.properties?.isLadder === true ||
            objTile.properties?.isLadder === "true" ||
            [58, 59, 60].includes(objTile.index)
        )) {
            return true;
        }

        const gTile = this.scene.groundLayer ? this.scene.groundLayer.getTileAtWorldXY(x, y) : null;
        if (gTile && gTile.index > 0 && (
            gTile.properties?.isLadder === true ||
            gTile.properties?.isLadder === "true" ||
            [58, 59, 60, 97, 98, 99].includes(gTile.index)
        )) {
            return true;
        }

        return false;
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

        if (this.corridors) {
            for (const corr of this.corridors) {
                if (corr.type === "vertical") {
                    if (Math.abs(cx - corr.x) <= 24 && cy >= corr.minY - 10 && cy <= corr.maxY + 10) {
                        return true;
                    }
                }
            }
        }

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

        const isClimbingLadder = this.isClimbing ||
            (this.targetNode && !isSegmentHorizontal(this.currentNode, this.targetNode, this.waypoints));

        let directChase = null;
        const activeCorridors = this.corridors || CORRIDORS;
        if (!isClimbingLadder) {
            directChase = checkDirectChase(eX, eY, pX, pY, activeCorridors);
        } else {
            const chase = checkDirectChase(eX, eY, pX, pY, activeCorridors);
            if (chase && chase.type === "vertical") {
                directChase = chase;
            }
        }

        if (directChase) {
            this.targetNode = null;
            this.isClimbing = false;

            if (directChase.type === "horizontal") {
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
                    this.body.play(this.runAnim, true);
                } else {
                    this.body.setVelocityX(0);
                    this.body.play(this.idleAnim, true);
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
                    this.body.play(this.runAnim, true);
                } else {
                    this.body.setVelocityY(0);
                    this.body.play(this.idleAnim, true);
                }
            }
            return;
        }
        const playerTargetNode = getClosestNode(pX, pOriginY, this.waypoints);
        if (!playerTargetNode) return;
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
            this.body.play(this.idleAnim, true);
            return;
        }

        const wp = this.waypoints[this.targetNode];
        const isVerticalMove = !isSegmentHorizontal(this.currentNode, this.targetNode, this.waypoints);

        if (isVerticalMove) {
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
            this.body.play(this.runAnim, true);
        } else {
            this.isClimbing = false;

            if (inLadder) {
                this.body.body.allowGravity = false;
                this.body.setVelocityY(0);
            } else {
                this.body.body.allowGravity = true;
            }

            const dx = wp.x - eX;
            if (Math.abs(dx) > 4) {
                this.body.setVelocityX(Math.sign(dx) * this.speed);
                this.body.setFlipX(dx < 0);
                this.body.play(this.runAnim, true);
            } else {
                this.body.setVelocityX(0);
                this.body.play(this.idleAnim, true);
            }
        }
    }
}
