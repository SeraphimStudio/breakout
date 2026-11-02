import Phaser from "phaser";

export default class BubbleText extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text = "Coming soon...", options = {}) {
        super(scene, x, y);

        this.scene = scene;
        this.rawText = text;
        this.baseX = x;
        this.baseY = y;

        this.fontSize = options.fontSize || "9px";
        this.fontFamily = options.fontFamily || "'Trebuchet MS', 'Segoe UI', Arial, sans-serif";
        this.fontWeight = options.fontWeight || "bold";
        this.textColor = options.textColor || "#0f172a";

        this.radius = options.radius !== undefined ? options.radius : 6;
        this.bgColor = options.bgColor !== undefined ? options.bgColor : 0xf59e0b;
        this.strokeColor = options.strokeColor !== undefined ? options.strokeColor : 0xfef08a;
        this.strokeWidth = options.strokeWidth !== undefined ? options.strokeWidth : 1.5;

        this.hasTail = options.hasTail !== undefined ? options.hasTail : true;
        this.tailDirection = options.tailDirection || "down";
        this.tailWidth = options.tailWidth || 8;
        this.tailHeight = options.tailHeight || 5;
        this.tailOffset = options.tailOffset || 0;

        this.shadowEnabled = options.shadow !== undefined ? options.shadow : true;
        this.shadowOffset = options.shadowOffset !== undefined ? options.shadowOffset : 2;

        this.floating = options.floating !== undefined ? options.floating : true;
        this.floatDistance = options.floatDistance || 2;
        this.floatDuration = options.floatDuration || 1100;
        this.floatTween = null;
        this.isWiggling = false;

        this.setDepth(options.depth || 20);

        this.label = scene.add.text(0, 0, this.rawText, {
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            fontStyle: this.fontWeight,
            color: this.textColor,
            align: "center"
        }).setOrigin(0.5, 0.5);
        this.label.setShadow(1, 1, "#000000", 0);

        const paddingX = options.paddingX !== undefined ? options.paddingX : 8;
        const paddingY = options.paddingY !== undefined ? options.paddingY : 4;
        this.customWidth = options.width || null;
        this.customHeight = options.height || null;
        this.bubbleWidth = this.customWidth || Math.max(54, this.label.width + paddingX * 2);
        this.bubbleHeight = this.customHeight || Math.max(16, this.label.height + paddingY * 2);

        this.shadowGraphic = scene.add.graphics();
        this.add(this.shadowGraphic);

        this.bubbleGraphic = scene.add.graphics();
        this.add(this.bubbleGraphic);

        this.add(this.label);

        this.hitZone = scene.add.zone(0, 0, this.bubbleWidth, this.bubbleHeight + (this.hasTail ? this.tailHeight : 0))
            .setOrigin(0.5, 0.5);
        this.add(this.hitZone);
        this.hitZone.setInteractive({ useHandCursor: true });
        this.hitZone.on("pointerdown", () => this.wiggle());
        this.hitZone.on("pointerover", () => this.wiggle());

        this.draw();

        if (this.floating) {
            this.startFloating();
        }

        scene.add.existing(this);
    }

    draw() {
        this.shadowGraphic.clear();
        this.bubbleGraphic.clear();

        const halfW = this.bubbleWidth / 2;
        const halfH = this.bubbleHeight / 2;

        if (this.shadowEnabled) {
            this.shadowGraphic.fillStyle(0x000000, 1);
            this.shadowGraphic.fillRoundedRect(
                -halfW,
                -halfH + this.shadowOffset,
                this.bubbleWidth,
                this.bubbleHeight,
                this.radius
            );
            if (this.hasTail && this.tailDirection === "down") {
                this.shadowGraphic.beginPath();
                this.shadowGraphic.moveTo(this.tailOffset - this.tailWidth / 2, halfH + this.shadowOffset);
                this.shadowGraphic.lineTo(this.tailOffset, halfH + this.tailHeight + this.shadowOffset);
                this.shadowGraphic.lineTo(this.tailOffset + this.tailWidth / 2, halfH + this.shadowOffset);
                this.shadowGraphic.closePath();
                this.shadowGraphic.fillPath();
            }
        }

        this.bubbleGraphic.fillStyle(this.bgColor, 1);
        this.bubbleGraphic.fillRoundedRect(
            -halfW,
            -halfH,
            this.bubbleWidth,
            this.bubbleHeight,
            this.radius
        );

        if (this.strokeWidth > 0) {
            this.bubbleGraphic.lineStyle(this.strokeWidth, this.strokeColor, 1);
            this.bubbleGraphic.strokeRoundedRect(
                -halfW,
                -halfH,
                this.bubbleWidth,
                this.bubbleHeight,
                this.radius
            );
        }

        if (this.hasTail) {
            this.bubbleGraphic.fillStyle(this.bgColor, 1);
            this.bubbleGraphic.beginPath();

            if (this.tailDirection === "down") {
                const tx = this.tailOffset;
                const ty = halfH - 1;
                this.bubbleGraphic.moveTo(tx - this.tailWidth / 2, ty);
                this.bubbleGraphic.lineTo(tx, ty + this.tailHeight + 1);
                this.bubbleGraphic.lineTo(tx + this.tailWidth / 2, ty);
                this.bubbleGraphic.closePath();
                this.bubbleGraphic.fillPath();

                if (this.strokeWidth > 0) {
                    this.bubbleGraphic.lineStyle(this.strokeWidth, this.strokeColor, 1);
                    this.bubbleGraphic.beginPath();
                    this.bubbleGraphic.moveTo(tx - this.tailWidth / 2, ty);
                    this.bubbleGraphic.lineTo(tx, ty + this.tailHeight + 1);
                    this.bubbleGraphic.lineTo(tx + this.tailWidth / 2, ty);
                    this.bubbleGraphic.strokePath();
                }
            } else if (this.tailDirection === "up") {
                const tx = this.tailOffset;
                const ty = -halfH + 1;
                this.bubbleGraphic.moveTo(tx - this.tailWidth / 2, ty);
                this.bubbleGraphic.lineTo(tx, ty - this.tailHeight - 1);
                this.bubbleGraphic.lineTo(tx + this.tailWidth / 2, ty);
                this.bubbleGraphic.closePath();
                this.bubbleGraphic.fillPath();

                if (this.strokeWidth > 0) {
                    this.bubbleGraphic.lineStyle(this.strokeWidth, this.strokeColor, 1);
                    this.bubbleGraphic.beginPath();
                    this.bubbleGraphic.moveTo(tx - this.tailWidth / 2, ty);
                    this.bubbleGraphic.lineTo(tx, ty - this.tailHeight - 1);
                    this.bubbleGraphic.lineTo(tx + this.tailWidth / 2, ty);
                    this.bubbleGraphic.strokePath();
                }
            }
        }
    }

    startFloating() {
        this.stopFloating();
        this.floatTween = this.scene.tweens.add({
            targets: this,
            y: this.baseY - this.floatDistance,
            duration: this.floatDuration,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
    }

    stopFloating() {
        if (this.floatTween) {
            this.floatTween.stop();
            this.floatTween = null;
        }
        this.y = this.baseY;
    }

    wiggle() {
        if (!this.scene || this.isWiggling) return;
        this.isWiggling = true;

        this.scene.tweens.add({
            targets: this,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 90,
            yoyo: true,
            ease: "Back.easeOut",
            onComplete: () => {
                this.setScale(1);
            }
        });

        this.scene.tweens.add({
            targets: this,
            angle: { from: -4, to: 4 },
            duration: 45,
            yoyo: true,
            repeat: 3,
            ease: "Linear",
            onComplete: () => {
                this.setAngle(0);
                this.isWiggling = false;
            }
        });
    }

    setText(text) {
        this.rawText = text;
        this.label.setText(text);
        if (!this.customWidth) {
            this.bubbleWidth = Math.max(54, this.label.width + 16);
        }
        if (!this.customHeight) {
            this.bubbleHeight = Math.max(16, this.label.height + 8);
        }
        this.draw();
    }

    destroy(fromScene) {
        this.stopFloating();
        super.destroy(fromScene);
    }
}

export { BubbleText };
