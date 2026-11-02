import Phaser from "phaser";
import LevelBtn from "../components/levelBtn";
import { LEVELS } from "../data/levelProvider";

export default class LevelScene extends Phaser.Scene {
    constructor() {
        super("LevelScene");
        this.levelBtns = [];
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0f1d);

        const grid = this.add.graphics();
        grid.lineStyle(1, 0x1e293b, 0.4);
        for (let y = 30; y < height; y += 30) {
            grid.lineBetween(0, y, width, y);
        }
        for (let x = 40; x < width; x += 40) {
            grid.lineBetween(x, 0, x, height);
        }

        const title = this.add.text(width / 2, 34, "SELECT LEVEL", {
            fontSize: "22px",
            fontFamily: "'Trebuchet MS', 'Segoe UI', Arial, sans-serif",
            fontStyle: "bold",
            color: "#38bdf8"
        }).setOrigin(0.5, 0.5);
        title.setShadow(0, 2, "#0369a1", 4, true, true);

        this.add.text(width / 2, 54, "CHOOSE AN INFILTRATION SECTOR", {
            fontSize: "9px",
            fontFamily: "'Courier New', monospace",
            fontStyle: "bold",
            color: "#94a3b8"
        }).setOrigin(0.5, 0.5);

        this.add.rectangle(width / 2, 68, width - 80, 1, 0x334155);
        const positions = [
            { x: 110, y: 104 }, // Level 1
            { x: 240, y: 104 }, // Level 2
            { x: 370, y: 104 }, // Level 3
            { x: 175, y: 158 }, // Level 4
            { x: 305, y: 158 }  // Level 5
        ];

        this.levelBtns = [];

        for (let i = 0; i < 5; i++) {
            const levelNum = i + 1;
            const levelData = LEVELS[i] || {
                title: `Level ${levelNum}`,
                name: `Sector ${levelNum}`,
                difficulty: "Normal"
            };

            const pos = positions[i];
            const btn = new LevelBtn(
                this,
                pos.x,
                pos.y,
                `Level ${levelNum}`,
                () => {
                    this.scene.start("GameScene", { level: levelNum });
                },
                {
                    width: 110,
                    height: 38,
                    fontSize: "13px",
                    subtitle: `${levelData.name}`,
                    subFontSize: "8px",
                    subColor: "#93c5fd",
                    bgColor: levelNum <= 2 ? 0x1e3a8a : 0x1e293b,
                    hoverColor: 0x2563eb,
                    strokeColor: levelNum <= 2 ? 0x60a5fa : 0x38bdf8
                }
            );

            this.levelBtns.push(btn);
        }

        this.backBtn = new LevelBtn(
            this,
            width / 2,
            222,
            "◄ Back to Menu",
            () => {
                this.scene.start("mainmenu");
            },
            {
                width: 140,
                height: 28,
                fontSize: "12px",
                bgColor: 0x334155,
                hoverColor: 0x475569,
                strokeColor: 0x64748b,
                hoverStrokeColor: 0x94a3b8
            }
        );

        this.input.keyboard.on("keydown-ESC", () => {
            this.scene.start("mainmenu");
        });

        for (let num = 1; num <= 5; num++) {
            this.input.keyboard.on(`keydown-${num}`, () => {
                this.scene.start("GameScene", { level: num });
            });
        }
    }
}
