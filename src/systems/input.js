import Phaser from "phaser";

export default class InputSystem {
    /**
     * @param {Phaser.Scene} scene 
     * @param {object} [customBindings] 
     */
    constructor(scene, customBindings = {}) {
        this.scene = scene;
        this.keyboard = scene.input.keyboard;

        this.defaultBindings = {
            "move-left": [Phaser.Input.Keyboard.KeyCodes.A, Phaser.Input.Keyboard.KeyCodes.LEFT],
            "move-right": [Phaser.Input.Keyboard.KeyCodes.D, Phaser.Input.Keyboard.KeyCodes.RIGHT],
            "move-up": [Phaser.Input.Keyboard.KeyCodes.W, Phaser.Input.Keyboard.KeyCodes.UP],
            "move-down": [Phaser.Input.Keyboard.KeyCodes.S, Phaser.Input.Keyboard.KeyCodes.DOWN],
            "jump": [
                Phaser.Input.Keyboard.KeyCodes.SPACE,
                Phaser.Input.Keyboard.KeyCodes.W,
                Phaser.Input.Keyboard.KeyCodes.UP
            ],
            "escape": [Phaser.Input.Keyboard.KeyCodes.ESC]
        };

        this.bindings = {
            ...this.defaultBindings,
            ...customBindings
        };

        this.actionKeys = {};
        this.init();
    }


    init() {
        if (!this.keyboard) return;

        for (const [action, keyCodes] of Object.entries(this.bindings)) {
            const codes = Array.isArray(keyCodes) ? keyCodes : [keyCodes];
            this.actionKeys[action] = codes.map((code) => this.keyboard.addKey(code));
        }
    }

    isDown(action) {
        const keys = this.actionKeys[action];
        if (!keys) return false;
        for (const key of keys) {
            if (key && key.isDown) {
                return true;
            }
        }
        return false;
    }

    isJustDown(action) {
        const keys = this.actionKeys[action];
        if (!keys) return false;
        for (const key of keys) {
            if (key && Phaser.Input.Keyboard.JustDown(key)) {
                return true;
            }
        }
        return false;
    }

    isUp(action) {
        return !this.isDown(action);
    }


    isActionDown(action) {
        return this.isDown(action);
    }


    isActionJustDown(action) {
        return this.isJustDown(action);
    }


    get actions() {
        return new Proxy(this, {
            get: (target, prop) => {
                if (typeof prop === "string") {
                    return target.isDown(prop);
                }
                return false;
            }
        });
    }

    bind(action, keyCodes) {
        const codes = Array.isArray(keyCodes) ? keyCodes : [keyCodes];
        this.bindings[action] = codes;
        if (this.keyboard) {
            this.actionKeys[action] = codes.map((code) => this.keyboard.addKey(code));
        }
    }
}
