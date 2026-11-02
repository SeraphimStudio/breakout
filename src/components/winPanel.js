import Phaser from "phaser";
import LevelBtn from "./levelBtn";

export default class WinPanel extends Phaser.GameObjects.Container {
    constructor(scene, options = {}) {
        const cx = scene.cameras.main.width / 2;
        const cy = scene.cameras.main.height / 2;

        super(scene, 0, 0);

        this.scene = scene;
        this.level = options.level || 1;
        this.starsCollected = options.starsCollected || 0;
        this.totalStars = options.totalStars || 3;

        this.setDepth(1000);
        this.setScrollFactor(0, 0, true);

        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        const backdrop = scene.add.rectangle(cx, cy, width, height, 0x000000, 0.75);
        backdrop.setInteractive();
        backdrop.setScrollFactor(0);
        this.add(backdrop);

        const winWidth = 330;
        const winHeight = 195;

        const shadow = scene.add.graphics();
        shadow.fillStyle(0x000000, 1);
        shadow.fillRoundedRect(cx - winWidth / 2, cy - winHeight / 2 + 4, winWidth, winHeight, 8);
        shadow.setScrollFactor(0);
        this.add(shadow);

        const bg = scene.add.graphics();
        bg.fillStyle(0x0f172a, 1);
        bg.fillRoundedRect(cx - winWidth / 2, cy - winHeight / 2, winWidth, winHeight, 8);
        bg.lineStyle(2, 0x10b981, 1);
        bg.strokeRoundedRect(cx - winWidth / 2, cy - winHeight / 2, winWidth, winHeight, 8);
        bg.setScrollFactor(0);
        this.add(bg);

        const title = scene.add.text(cx, cy - 65, "VICTORY!", {
            fontSize: "20px",
            fontFamily: "'Trebuchet MS', 'Segoe UI', Arial, sans-serif",
            fontStyle: "bold",
            color: "#34d399"
        }).setOrigin(0.5, 0.5).setScrollFactor(0);
        title.setShadow(2, 2, "#000000", 0);
        this.add(title);

        const subtitle = scene.add.text(cx, cy - 44, `Sector ${this.level} Infiltration Clear`, {
            fontSize: "9px",
            fontFamily: "'Courier New', monospace",
            fontStyle: "bold",
            color: "#94a3b8"
        }).setOrigin(0.5, 0.5).setScrollFactor(0);
        this.add(subtitle);

        const sep = scene.add.graphics();
        sep.lineStyle(1, 0x334155, 1);
        sep.lineBetween(cx - winWidth / 2 + 16, cy - 32, cx + winWidth / 2 - 16, cy - 32);
        sep.setScrollFactor(0);
        this.add(sep);

        const starCount = Math.max(3, this.totalStars);
        const starSpacing = 28;
        const starStartX = cx - ((starCount - 1) * starSpacing) / 2;

        for (let i = 0; i < starCount; i++) {
            const isEarned = i < this.starsCollected;
            const starText = scene.add.text(starStartX + i * starSpacing, cy - 8, "★", {
                fontSize: "24px",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
                color: isEarned ? "#fbbf24" : "#334155"
            }).setOrigin(0.5, 0.5).setScrollFactor(0);

            if (isEarned) {
                starText.setShadow(1, 1, "#000000", 0);
            }
            this.add(starText);
        }

        const starsLabel = scene.add.text(cx, cy + 18, `${this.starsCollected} of ${this.totalStars} Sector Stars Collected`, {
            fontSize: "10px",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            color: "#e2e8f0"
        }).setOrigin(0.5, 0.5).setScrollFactor(0);
        this.add(starsLabel);

        const buttonY = cy + 58;

        const hasNext = this.level < 4;
        const nextBtnText = hasNext ? "Next Level" : "All Clear";
        const nextBtn = new LevelBtn(scene, cx - 100, buttonY, nextBtnText, () => {
            if (typeof options.onNextLevel === "function") {
                options.onNextLevel();
            }
        }, {
            width: 88,
            height: 26,
            fontSize: "11px",
            bgColor: 0x059669,
            hoverColor: 0x10b981,
            strokeColor: 0x34d399,
            hoverStrokeColor: 0x6ee7b7
        });
        nextBtn.setScrollFactor(0, 0, true);
        this.add(nextBtn);

        const replayBtn = new LevelBtn(scene, cx, buttonY, "Replay", () => {
            if (typeof options.onReplay === "function") {
                options.onReplay();
            }
        }, {
            width: 76,
            height: 26,
            fontSize: "11px",
            bgColor: 0x1e3a8a,
            hoverColor: 0x2563eb,
            strokeColor: 0x60a5fa,
            hoverStrokeColor: 0x93c5fd
        });
        replayBtn.setScrollFactor(0, 0, true);
        this.add(replayBtn);

        const levelSelectBtn = new LevelBtn(scene, cx + 96, buttonY, "Select Level", () => {
            if (typeof options.onLevelSelect === "function") {
                options.onLevelSelect();
            }
        }, {
            width: 88,
            height: 26,
            fontSize: "11px",
            bgColor: 0x334155,
            hoverColor: 0x475569,
            strokeColor: 0x64748b,
            hoverStrokeColor: 0x94a3b8
        });
        levelSelectBtn.setScrollFactor(0, 0, true);
        this.add(levelSelectBtn);

        scene.add.existing(this);

        this.setAlpha(0);
        scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 200,
            ease: "Power2"
        });
    }
}
