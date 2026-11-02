import Phaser from "phaser";
import LevelBtn from "./levelBtn";
import soundManager from "../systems/soundManager";

export default class OptionsPanel extends Phaser.GameObjects.Container {
    constructor(scene, options = {}) {
        const cx = scene.cameras.main.width / 2;
        const cy = scene.cameras.main.height / 2;

        super(scene, 0, 0);

        this.scene = scene;
        this.setDepth(1000);
        this.setScrollFactor(0, 0, true);

        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        const backdrop = scene.add.rectangle(cx, cy, width, height, 0x000000, 0.75);
        backdrop.setInteractive();
        backdrop.setScrollFactor(0);
        this.add(backdrop);

        const winWidth = 300;
        const winHeight = 175;

        const shadow = scene.add.graphics();
        shadow.fillStyle(0x000000, 1);
        shadow.fillRoundedRect(cx - winWidth / 2, cy - winHeight / 2 + 4, winWidth, winHeight, 8);
        shadow.setScrollFactor(0);
        this.add(shadow);

        const bg = scene.add.graphics();
        bg.fillStyle(0x0f172a, 1);
        bg.fillRoundedRect(cx - winWidth / 2, cy - winHeight / 2, winWidth, winHeight, 8);
        bg.lineStyle(2, 0x38bdf8, 1);
        bg.strokeRoundedRect(cx - winWidth / 2, cy - winHeight / 2, winWidth, winHeight, 8);
        bg.setScrollFactor(0);
        this.add(bg);

        const title = scene.add.text(cx, cy - 60, "OPTIONS", {
            fontSize: "16px",
            fontFamily: "'Trebuchet MS', 'Segoe UI', Arial, sans-serif",
            fontStyle: "bold",
            color: "#38bdf8"
        }).setOrigin(0.5, 0.5).setScrollFactor(0);
        title.setShadow(2, 2, "#000000", 0);
        this.add(title);

        const sep = scene.add.graphics();
        sep.lineStyle(1, 0x334155, 1);
        sep.lineBetween(cx - winWidth / 2 + 16, cy - 42, cx + winWidth / 2 - 16, cy - 42);
        sep.setScrollFactor(0);
        this.add(sep);

        const musicY = cy - 14;
        const musicLabel = scene.add.text(cx - 100, musicY, "MUSIC", {
            fontSize: "11px",
            fontFamily: "'Courier New', monospace",
            fontStyle: "bold",
            color: "#94a3b8"
        }).setOrigin(0, 0.5).setScrollFactor(0);
        this.add(musicLabel);

        this.musicBarGraphic = scene.add.graphics().setScrollFactor(0);
        this.add(this.musicBarGraphic);

        this.musicValText = scene.add.text(cx + 10, musicY, "", {
            fontSize: "10px",
            fontFamily: "'Courier New', monospace",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5, 0.5).setScrollFactor(0);
        this.add(this.musicValText);

        const musicMinus = new LevelBtn(scene, cx - 40, musicY, "-", () => {
            const current = soundManager.getMusicVolume();
            soundManager.setMusicVolume(Math.max(0, current - 0.1));
            this.updateDisplay();
        }, {
            width: 24,
            height: 22,
            fontSize: "12px",
            bgColor: 0x1e293b,
            hoverColor: 0x334155,
            strokeColor: 0x475569
        });
        musicMinus.setScrollFactor(0, 0, true);
        this.add(musicMinus);

        const musicPlus = new LevelBtn(scene, cx + 65, musicY, "+", () => {
            const current = soundManager.getMusicVolume();
            soundManager.setMusicVolume(Math.min(1, current + 0.1));
            this.updateDisplay();
        }, {
            width: 24,
            height: 22,
            fontSize: "12px",
            bgColor: 0x1e293b,
            hoverColor: 0x334155,
            strokeColor: 0x475569
        });
        musicPlus.setScrollFactor(0, 0, true);
        this.add(musicPlus);

        const sfxY = cy + 18;
        const sfxLabel = scene.add.text(cx - 100, sfxY, "SFX", {
            fontSize: "11px",
            fontFamily: "'Courier New', monospace",
            fontStyle: "bold",
            color: "#94a3b8"
        }).setOrigin(0, 0.5).setScrollFactor(0);
        this.add(sfxLabel);

        this.sfxBarGraphic = scene.add.graphics().setScrollFactor(0);
        this.add(this.sfxBarGraphic);

        this.sfxValText = scene.add.text(cx + 10, sfxY, "", {
            fontSize: "10px",
            fontFamily: "'Courier New', monospace",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5, 0.5).setScrollFactor(0);
        this.add(this.sfxValText);

        const sfxMinus = new LevelBtn(scene, cx - 40, sfxY, "-", () => {
            const current = soundManager.getSfxVolume();
            soundManager.setSfxVolume(Math.max(0, current - 0.1));
            this.updateDisplay();
            soundManager.playPop();
        }, {
            width: 24,
            height: 22,
            fontSize: "12px",
            bgColor: 0x1e293b,
            hoverColor: 0x334155,
            strokeColor: 0x475569
        });
        sfxMinus.setScrollFactor(0, 0, true);
        this.add(sfxMinus);

        const sfxPlus = new LevelBtn(scene, cx + 65, sfxY, "+", () => {
            const current = soundManager.getSfxVolume();
            soundManager.setSfxVolume(Math.min(1, current + 0.1));
            this.updateDisplay();
            soundManager.playPop();
        }, {
            width: 24,
            height: 22,
            fontSize: "12px",
            bgColor: 0x1e293b,
            hoverColor: 0x334155,
            strokeColor: 0x475569
        });
        sfxPlus.setScrollFactor(0, 0, true);
        this.add(sfxPlus);

        const closeBtn = new LevelBtn(scene, cx, cy + 56, "Close", () => {
            this.close();
            if (typeof options.onClose === "function") {
                options.onClose();
            }
        }, {
            width: 80,
            height: 24,
            fontSize: "11px",
            bgColor: 0x334155,
            hoverColor: 0x475569,
            strokeColor: 0x64748b,
            hoverStrokeColor: 0x94a3b8
        });
        closeBtn.setScrollFactor(0, 0, true);
        this.add(closeBtn);

        this.cx = cx;
        this.musicY = musicY;
        this.sfxY = sfxY;

        this.updateDisplay();

        scene.add.existing(this);

        this.setAlpha(0);
        scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 150,
            ease: "Power2"
        });
    }

    updateDisplay() {
        const musicVol = soundManager.getMusicVolume();
        const sfxVol = soundManager.getSfxVolume();

        this.musicValText.setText(Math.round(musicVol * 100) + "%");
        this.sfxValText.setText(Math.round(sfxVol * 100) + "%");

        const barW = 60;
        const barH = 14;
        const barX = this.cx - 20;

        this.musicBarGraphic.clear();
        this.musicBarGraphic.fillStyle(0x1e293b, 1);
        this.musicBarGraphic.fillRoundedRect(barX, this.musicY - barH / 2, barW, barH, 3);
        if (musicVol > 0) {
            this.musicBarGraphic.fillStyle(0x38bdf8, 1);
            this.musicBarGraphic.fillRoundedRect(barX, this.musicY - barH / 2, Math.max(4, barW * musicVol), barH, 3);
        }
        this.musicBarGraphic.lineStyle(1, 0x475569, 1);
        this.musicBarGraphic.strokeRoundedRect(barX, this.musicY - barH / 2, barW, barH, 3);

        this.sfxBarGraphic.clear();
        this.sfxBarGraphic.fillStyle(0x1e293b, 1);
        this.sfxBarGraphic.fillRoundedRect(barX, this.sfxY - barH / 2, barW, barH, 3);
        if (sfxVol > 0) {
            this.sfxBarGraphic.fillStyle(0x10b981, 1);
            this.sfxBarGraphic.fillRoundedRect(barX, this.sfxY - barH / 2, Math.max(4, barW * sfxVol), barH, 3);
        }
        this.sfxBarGraphic.lineStyle(1, 0x475569, 1);
        this.sfxBarGraphic.strokeRoundedRect(barX, this.sfxY - barH / 2, barW, barH, 3);
    }

    close() {
        if (!this.scene) return;
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 120,
            onComplete: () => {
                this.destroy();
            }
        });
    }
}

