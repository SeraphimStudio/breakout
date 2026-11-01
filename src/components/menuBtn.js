import LevelBtn from "./levelBtn";

/**
 * MenuBtn - Preset button configuration specialized for main menu navigation.
 */
export default class MenuBtn extends LevelBtn {
    constructor(scene, x, y, text, callback = () => {}, options = {}) {
        super(scene, x, y, text, callback, {
            width: 150,
            height: 30,
            radius: 6,
            fontSize: "13px",
            ...options
        });
    }
}

export { MenuBtn, LevelBtn };

