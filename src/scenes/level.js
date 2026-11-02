import Phaser from "phaser";
import LevelBtn from "../components/levelBtn";
import BubbleText from "../components/bubbleText";
import soundManager from "../systems/soundManager";

export default class LevelScene extends Phaser.Scene {
    constructor() {
        super("LevelScene");
        this.levelBtns = [];
        this.comingSoonBubble = null;
    }

    create() {
        soundManager.init(this.sound);
        soundManager.playMusic("bg_ost");

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0f1d);

        const title = this.add.text(width / 2, 34, "SELECT LEVEL", {
            fontSize: "22px",
            fontFamily: "'Trebuchet MS', 'Segoe UI', Arial, sans-serif",
            fontStyle: "bold",
            color: "#38bdf8"
        }).setOrigin(0.5, 0.5);
        title.setShadow(2, 2, "#000000", 0);

        this.add.text(width / 2, 54, "CHOOSE AN INFILTRATION SECTOR", {
            fontSize: "9px",
            fontFamily: "'Courier New', monospace",
            fontStyle: "bold",
            color: "#94a3b8"
        }).setOrigin(0.5, 0.5);

        this.add.rectangle(width / 2, 68, width - 80, 1, 0x334155);
        const positions = [
            { x: 110, y: 104 },
            { x: 240, y: 104 },
            { x: 370, y: 104 },
            { x: 175, y: 158 },
            { x: 305, y: 158 }
        ];

        this.levelBtns = [];

        for (let i = 0; i < 5; i++) {
            const levelNum = i + 1;
            const pos = positions[i];
            const isLevel5 = levelNum === 5;

            const btn = new LevelBtn(
                this,
                pos.x,
                pos.y,
                `Level ${levelNum}`,
                () => {
                    if (isLevel5) {
                        if (this.comingSoonBubble) this.comingSoonBubble.wiggle();
                        return;
                    }
                    this.scene.start("GameScene", { level: levelNum });
                },
                {
                    width: 110,
                    height: 34,
                    fontSize: "13px",
                    bgColor: levelNum <= 4 ? 0x1e3a8a : 0x1e293b,
                    hoverColor: levelNum <= 4 ? 0x2563eb : 0x1e293b,
                    strokeColor: levelNum <= 4 ? 0x60a5fa : 0x475569
                }
            );

            if (isLevel5) {
                btn.hitZone.on("pointerover", () => {
                    if (this.comingSoonBubble) this.comingSoonBubble.wiggle();
                });
            }

            this.levelBtns.push(btn);
        }

        const lvl5Pos = positions[4];
        this.comingSoonBubble = new BubbleText(
            this,
            lvl5Pos.x,
            lvl5Pos.y - 30,
            "Coming soon...",
            {
                fontSize: "9px",
                hasTail: true,
                tailDirection: "down",
                floating: true
            }
        );

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
                if (num === 5) {
                    if (this.comingSoonBubble) this.comingSoonBubble.wiggle();
                    return;
                }
                this.scene.start("GameScene", { level: num });
            });
        }
    }
}
