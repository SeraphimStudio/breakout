import Phaser from "phaser";
import LevelBtn from "./levelBtn";

/**
 * LosePanel - Modal dialog overlay displayed when the player collides with an enemy.
 * Informs the player of mission failure and provides options to retry or navigate.
 */
export default class LosePanel extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene - The active game scene.
     * @param {object} options - Configuration options.
     * @param {number} [options.level=1] - Failed level number.
     * @param {Function} [options.onRetry] - Callback to restart the level.
     * @param {Function} [options.onLevelSelect] - Callback to return to level scene.
     * @param {Function} [options.onMainMenu] - Callback to return to main menu.
     */
    constructor(scene, options = {}) {
        const cx = scene.cameras.main.width / 2;
        const cy = scene.cameras.main.height / 2;

        super(scene, 0, 0);

        this.scene = scene;
        this.level = options.level || 1;

        this.setDepth(1000);
        this.setScrollFactor(0, 0, true);

        // 1. Semi-transparent backdrop (blocks world clicks)
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        const backdrop = scene.add.rectangle(cx, cy, width, height, 0x000000, 0.75);
        backdrop.setInteractive();
        backdrop.setScrollFactor(0);
        this.add(backdrop);

        // 2. Dialog Window Geometry
        const winWidth = 320;
        const winHeight = 185;

        // Window Shadow
        const shadow = scene.add.graphics();
        shadow.fillStyle(0x000000, 0.5);
        shadow.fillRoundedRect(cx - winWidth / 2, cy - winHeight / 2 + 4, winWidth, winHeight, 8);
        shadow.setScrollFactor(0);
        this.add(shadow);

        // Window Frame & Background
        const bg = scene.add.graphics();
        bg.fillStyle(0x0f172a, 1);
        bg.fillRoundedRect(cx - winWidth / 2, cy - winHeight / 2, winWidth, winHeight, 8);
        bg.lineStyle(2, 0xef4444, 1);
        bg.strokeRoundedRect(cx - winWidth / 2, cy - winHeight / 2, winWidth, winHeight, 8);
        bg.setScrollFactor(0);
        this.add(bg);

        // 3. Header Title
        const title = scene.add.text(cx, cy - 60, "BUSTED!", {
            fontSize: "20px",
            fontFamily: "'Trebuchet MS', 'Segoe UI', Arial, sans-serif",
            fontStyle: "bold",
            color: "#f87171"
        }).setOrigin(0.5, 0.5).setScrollFactor(0);
        title.setShadow(0, 2, "#7f1d1d", 4, true, true);
        this.add(title);

        // Subtitle
        const subtitle = scene.add.text(cx, cy - 38, `Sector ${this.level} Infiltration Compromised`, {
            fontSize: "9px",
            fontFamily: "'Courier New', monospace",
            fontStyle: "bold",
            color: "#94a3b8"
        }).setOrigin(0.5, 0.5).setScrollFactor(0);
        this.add(subtitle);

        // Separator
        const sep = scene.add.graphics();
        sep.lineStyle(1, 0x334155, 1);
        sep.lineBetween(cx - winWidth / 2 + 16, cy - 26, cx + winWidth / 2 - 16, cy - 26);
        sep.setScrollFactor(0);
        this.add(sep);

        // 4. Failure Message Content
        const messageText = scene.add.text(cx, cy + 2, "You were intercepted by the patrol unit!\nSector stars for this attempt have been cleared.", {
            fontSize: "10px",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            color: "#cbd5e1",
            align: "center",
            lineSpacing: 4
        }).setOrigin(0.5, 0.5).setScrollFactor(0);
        this.add(messageText);

        // 5. Action Navigation Buttons
        const buttonY = cy + 50;

        // Button 1: Try Again
        const retryBtn = new LevelBtn(scene, cx - 98, buttonY, "Try Again", () => {
            if (typeof options.onRetry === "function") {
                options.onRetry();
            }
        }, {
            width: 86,
            height: 26,
            fontSize: "11px",
            bgColor: 0x991b1b,
            hoverColor: 0xdc2626,
            strokeColor: 0xef4444,
            hoverStrokeColor: 0xf87171
        });
        retryBtn.setScrollFactor(0, 0, true);
        this.add(retryBtn);

        // Button 2: Select Level
        const levelSelectBtn = new LevelBtn(scene, cx, buttonY, "Select Level", () => {
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

        // Button 3: Main Menu
        const menuBtn = new LevelBtn(scene, cx + 96, buttonY, "Main Menu", () => {
            if (typeof options.onMainMenu === "function") {
                options.onMainMenu();
            }
        }, {
            width: 84,
            height: 26,
            fontSize: "11px",
            bgColor: 0x1e293b,
            hoverColor: 0x334155,
            strokeColor: 0x475569,
            hoverStrokeColor: 0x64748b
        });
        menuBtn.setScrollFactor(0, 0, true);
        this.add(menuBtn);

        // Register to scene
        scene.add.existing(this);

        // Entry animation
        this.setAlpha(0);
        scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 200,
            ease: "Power2"
        });
    }
}

