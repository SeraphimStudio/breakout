class SoundManager {
    constructor() {
        this.sound = null;
        this.currentMusicKey = null;
        this.currentMusic = null;

        const savedMusic = typeof localStorage !== "undefined" ? localStorage.getItem("breakout_music_vol") : null;
        const savedSfx = typeof localStorage !== "undefined" ? localStorage.getItem("breakout_sfx_vol") : null;

        this.musicVolume = savedMusic !== null ? parseFloat(savedMusic) : 0.6;
        this.sfxVolume = savedSfx !== null ? parseFloat(savedSfx) : 0.8;
    }

    init(sound) {
        if (!sound) return;
        this.sound = sound;

        if (this.sound.locked) {
            this.sound.once("unlocked", () => {
                this.ensureMusic();
            });
        }
    }

    playMusic(key) {
        this.currentMusicKey = key;
        if (!this.sound) return;

        if (this.currentMusic && this.currentMusic.key === key && this.currentMusic.isPlaying) {
            this.currentMusic.setVolume(this.musicVolume);
            return;
        }

        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic.destroy();
            this.currentMusic = null;
        }

        try {
            this.currentMusic = this.sound.add(key, {
                volume: this.musicVolume,
                loop: true
            });
            this.currentMusic.play();
        } catch (e) {
        }
    }

    ensureMusic() {
        if (this.currentMusicKey && (!this.currentMusic || !this.currentMusic.isPlaying)) {
            const key = this.currentMusicKey;
            this.currentMusicKey = null;
            this.playMusic(key);
        }
    }

    stopMusic() {
        this.currentMusicKey = null;
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic.destroy();
            this.currentMusic = null;
        }
    }

    playSfx(key) {
        if (!this.sound || this.sfxVolume <= 0) return;
        try {
            this.sound.play(key, { volume: this.sfxVolume });
        } catch (e) {
        }
    }

    playPop() {
        this.playSfx("pop");
    }

    playGameOver() {
        this.playSfx("game_over");
    }

    playPowerup() {
        this.playSfx("powerup");
    }

    playVictory() {
        this.playSfx("victory");
    }

    setMusicVolume(vol) {
        this.musicVolume = Math.round(Math.max(0, Math.min(1, vol)) * 10) / 10;
        if (typeof localStorage !== "undefined") {
            localStorage.setItem("breakout_music_vol", this.musicVolume.toString());
        }
        if (this.currentMusic) {
            this.currentMusic.setVolume(this.musicVolume);
        }
    }

    setSfxVolume(vol) {
        this.sfxVolume = Math.round(Math.max(0, Math.min(1, vol)) * 10) / 10;
        if (typeof localStorage !== "undefined") {
            localStorage.setItem("breakout_sfx_vol", this.sfxVolume.toString());
        }
    }

    getMusicVolume() {
        return this.musicVolume;
    }

    getSfxVolume() {
        return this.sfxVolume;
    }
}

const soundManager = new SoundManager();
export default soundManager;
export { SoundManager, soundManager };

