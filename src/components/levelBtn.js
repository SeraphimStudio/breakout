import Phaser from "phaser";

export default class LevelBtn extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text, callback = () => { }, options = {}) {
        super(scene, x, y);

        this.scene = scene;
        this.callback = callback;
        this.btnText = text;

        this.btnWidth = options.width || 140;
        this.btnHeight = options.height || 32;
        this.radius = options.radius !== undefined ? options.radius : 6;

        this.bgColor = options.bgColor !== undefined ? options.bgColor : 0x1e293b;
        this.hoverColor = options.hoverColor !== undefined ? options.hoverColor : 0x2563eb;
        this.pressedColor = options.pressedColor !== undefined ? options.pressedColor : 0x1d4ed8;
        this.strokeColor = options.strokeColor !== undefined ? options.strokeColor : 0x38bdf8;
        this.hoverStrokeColor = options.hoverStrokeColor !== undefined ? options.hoverStrokeColor : 0x7dd3fc;
        this.strokeWidth = options.strokeWidth !== undefined ? options.strokeWidth : 2;

        this.textColor = options.textColor || "#ffffff";
        this.hoverTextColor = options.hoverTextColor || "#ffffff";
        this.fontSize = options.fontSize || "13px";
        this.fontFamily = options.fontFamily || "'Trebuchet MS', 'Segoe UI', Arial, sans-serif";
        this.fontWeight = options.fontWeight || "bold";

        this.disabled = Boolean(options.disabled);
        this.disabledColor = options.disabledColor !== undefined ? options.disabledColor : 0x334155;
        this.disabledTextColor = options.disabledTextColor || "#64748b";
        this.disabledStrokeColor = options.disabledStrokeColor !== undefined ? options.disabledStrokeColor : 0x475569;

        this.shadowEnabled = options.shadow !== undefined ? options.shadow : true;
        this.shadowOffset = options.shadowOffset || 3;

        this.isHovered = false;
        this.isPressed = false;

        this.shadow = scene.add.graphics();
        this.add(this.shadow);

        this.bg = scene.add.graphics();
        this.add(this.bg);

        const textY = options.subtitle ? -6 : 0;
        this.label = scene.add.text(0, textY, this.btnText, {
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            fontStyle: this.fontWeight,
            color: this.disabled ? this.disabledTextColor : this.textColor,
            align: "center"
        }).setOrigin(0.5, 0.5);
        this.label.setShadow(1, 1, "#000000", 2, true, true);
        this.add(this.label);

        if (options.subtitle) {
            this.sublabel = scene.add.text(0, 9, options.subtitle, {
                fontSize: options.subFontSize || "9px",
                fontFamily: this.fontFamily,
                fontStyle: "normal",
                color: options.subColor || "#94a3b8",
                align: "center"
            }).setOrigin(0.5, 0.5);
            this.add(this.sublabel);
        }

        this.hitZone = scene.add.zone(0, 0, this.btnWidth, this.btnHeight).setOrigin(0.5, 0.5);
        this.add(this.hitZone);

        this.drawShadow();
        if (this.disabled) {
            this.drawBg(this.disabledColor, this.disabledStrokeColor);
        } else {
            this.drawBg(this.bgColor, this.strokeColor);
            this.setupInteractions();
        }

        scene.add.existing(this);
    }

    drawShadow() {
        this.shadow.clear();
        if (!this.shadowEnabled) return;
        this.shadow.fillStyle(0x000000, 0.4);
        this.shadow.fillRoundedRect(
            -this.btnWidth / 2,
            -this.btnHeight / 2 + this.shadowOffset,
            this.btnWidth,
            this.btnHeight,
            this.radius
        );
    }

    drawBg(fillColor, strokeColor) {
        this.bg.clear();
        this.bg.fillStyle(fillColor, 1);
        this.bg.fillRoundedRect(
            -this.btnWidth / 2,
            -this.btnHeight / 2,
            this.btnWidth,
            this.btnHeight,
            this.radius
        );

        if (this.strokeWidth > 0) {
            this.bg.lineStyle(this.strokeWidth, strokeColor, 1);
            this.bg.strokeRoundedRect(
                -this.btnWidth / 2,
                -this.btnHeight / 2,
                this.btnWidth,
                this.btnHeight,
                this.radius
            );
        }

        this.bg.fillStyle(0xffffff, 0.08);
        this.bg.fillRoundedRect(
            -this.btnWidth / 2 + 1,
            -this.btnHeight / 2 + 1,
            this.btnWidth - 2,
            Math.max(4, Math.floor(this.btnHeight * 0.4)),
            { tl: Math.max(1, this.radius - 1), tr: Math.max(1, this.radius - 1), bl: 0, br: 0 }
        );
    }

    setupInteractions() {
        this.hitZone.setInteractive({ useHandCursor: true });

        this.hitZone.on("pointerover", () => {
            if (this.disabled) return;
            this.isHovered = true;
            this.drawBg(this.hoverColor, this.hoverStrokeColor);
            this.label.setColor(this.hoverTextColor);

            this.scene.tweens.killTweensOf(this);
            this.scene.tweens.add({
                targets: this,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 90,
                ease: "Power1"
            });
        });

        this.hitZone.on("pointerout", () => {
            if (this.disabled) return;
            this.isHovered = false;
            this.isPressed = false;
            this.drawBg(this.bgColor, this.strokeColor);
            this.label.setColor(this.textColor);

            this.scene.tweens.killTweensOf(this);
            this.scene.tweens.add({
                targets: this,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 90,
                ease: "Power1"
            });
        });

        this.hitZone.on("pointerdown", () => {
            if (this.disabled) return;
            this.isPressed = true;
            this.drawBg(this.pressedColor, this.strokeColor);

            this.scene.tweens.killTweensOf(this);
            this.scene.tweens.add({
                targets: this,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                ease: "Power1"
            });
        });

        this.hitZone.on("pointerup", () => {
            if (this.disabled || !this.isPressed) return;
            this.isPressed = false;
            this.drawBg(this.isHovered ? this.hoverColor : this.bgColor, this.isHovered ? this.hoverStrokeColor : this.strokeColor);

            this.scene.tweens.killTweensOf(this);
            this.scene.tweens.add({
                targets: this,
                scaleX: this.isHovered ? 1.05 : 1.0,
                scaleY: this.isHovered ? 1.05 : 1.0,
                duration: 80,
                ease: "Power1",
                onComplete: () => {
                    if (typeof this.callback === "function") {
                        this.callback(this);
                    }
                }
            });
        });
    }

    setText(text) {
        this.btnText = text;
        this.label.setText(text);
        return this;
    }

    setSubtitle(text) {
        if (!this.sublabel) {
            this.label.setY(-6);
            this.sublabel = this.scene.add.text(0, 9, text, {
                fontSize: "9px",
                fontFamily: this.fontFamily,
                color: "#94a3b8",
                align: "center"
            }).setOrigin(0.5, 0.5);
            this.add(this.sublabel);
        } else {
            this.sublabel.setText(text);
        }
        return this;
    }

    setDisabled(disabled) {
        this.disabled = Boolean(disabled);
        if (this.disabled) {
            this.hitZone.disableInteractive();
            this.label.setColor(this.disabledTextColor);
            this.drawBg(this.disabledColor, this.disabledStrokeColor);
            this.setScale(1.0);
        } else {
            this.hitZone.setInteractive({ useHandCursor: true });
            this.label.setColor(this.textColor);
            this.drawBg(this.bgColor, this.strokeColor);
        }
        return this;
    }

    setOnClick(callback) {
        this.callback = callback;
        return this;
    }

    setScrollFactor(x, y, updateChildren = true) {
        super.setScrollFactor(x, y, updateChildren);
        if (this.hitZone) {
            this.hitZone.setScrollFactor(x, y);
        }
        return this;
    }

    destroy(fromScene) {
        if (this.scene && this.scene.tweens) {
            this.scene.tweens.killTweensOf(this);
        }
        super.destroy(fromScene);
    }
}

export function createLevelBtn(scene, x, y, text, callback, options) {
    return new LevelBtn(scene, x, y, text, callback, options);
}
export { LevelBtn };

