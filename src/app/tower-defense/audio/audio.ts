type SoundCategory = 'music' | 'sfx';

export class AudioManager {
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private musicVolume: number = 0.3;
    private sfxVolume: number = 0.5;
    private isMuted: boolean = false;
    private currentMusic: HTMLAudioElement | null = null;

    constructor() {
        const savedMusicVolume = localStorage.getItem('td-music-volume');
        const savedSfxVolume = localStorage.getItem('td-sfx-volume');
        const savedMuted = localStorage.getItem('td-muted');

        if (savedMusicVolume)
            this.musicVolume = parseFloat(savedMusicVolume);

        if (savedSfxVolume)
            this.sfxVolume = parseFloat(savedSfxVolume);

        if (savedMuted)
            this.isMuted = savedMuted === 'true';
    }

    async preloadSounds() {
        const soundsToLoad = [
            {
                name: 'bg-music',
                src: '/textures/bg.mp3',
                category: 'music' as SoundCategory
            },
            {
                name: 'shoot-ninja-basic',
                src: '/textures/shurikensound.mp3',
                category: 'sfx' as SoundCategory
            },
            {
                name: 'shoot-ninja-gun',
                src: '/textures/deagleshotcs.mp3',
                category: 'sfx' as SoundCategory
            },
            {
                name: 'shoot-ninja-poison',
                src: '/textures/uspsshotcs.mp3',
                category: 'sfx' as SoundCategory
            },
            {
                name: 'shoot-ninja-smoke',
                src: '/textures/smokecs.mp3',
                category: 'sfx' as SoundCategory
            },
            {
                name: 'enemy-death',
                src: '/textures/death.mp3',
                category: 'sfx' as SoundCategory
            },
        ];

        const loadPromises = soundsToLoad.map(async (soundConfig) => {
            const audio = new Audio(soundConfig.src);
            const volumeToUse = soundConfig.category === 'music'
                ? this.musicVolume
                : this.sfxVolume;

            audio.volume = volumeToUse;
            audio.preload = 'auto';

            this.sounds.set(soundConfig.name, audio);
        });

        await Promise.all(loadPromises);
    }

    playBackgroundMusic() {
        if (this.isMuted)
            return;

        const music = this.sounds.get('bg-music');

        if (!music)
            return;

        music.loop = true;
        music.volume = this.musicVolume;

        music.play().catch(error => {
            console.warn('Autoplay blocked. Music will start on user interaction.', error);
        });

        this.currentMusic = music;
    }

    stopBackgroundMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
    }

    playSfx(soundName: string) {
        if (this.isMuted)
            return;

        const sound = this.sounds.get(soundName);

        if (!sound)
            return;

        const soundClone = sound.cloneNode() as HTMLAudioElement;
        soundClone.volume = this.sfxVolume;

        soundClone.play().catch(error => {
            console.warn('Could not play SFX:', error);
        });
    }

    playTowerShoot(towerTypeId: string) {
        const soundMapping: Record<string, string> = {
            'ninja_basic': 'shoot-ninja-basic',
            'ninja_gun': 'shoot-ninja-gun',
            'ninja_poison': 'shoot-ninja-poison',
            'ninja_smoke': 'shoot-ninja-smoke',
        };

        const soundName = soundMapping[towerTypeId] || 'shoot-ninja-basic';
        this.playSfx(soundName);
    }

    setMusicVolume(volume: number) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('td-music-volume', this.musicVolume.toString());

        if (this.currentMusic)
            this.currentMusic.volume = this.musicVolume;

        this.sounds.forEach((audio, name) => {
            if (name.includes('music')) {
                audio.volume = this.musicVolume;
            }
        });
    }

    setSfxVolume(volume: number) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('td-sfx-volume', this.sfxVolume.toString());

        this.sounds.forEach((audio, name) => {
            if (!name.includes('music'))
                audio.volume = this.sfxVolume;
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('td-muted', this.isMuted.toString());

        if (this.isMuted)
            this.currentMusic?.pause();
        else
            this.currentMusic?.play().catch(() => { });

        return this.isMuted;
    }

    getMusicVolume() {
        return this.musicVolume;
    }

    getSfxVolume() {
        return this.sfxVolume;
    }

    getIsMuted() {
        return this.isMuted;
    }
}

export const audioManager = new AudioManager();