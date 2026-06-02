export class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicInterval = null;
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.startBackgroundMusic();
    } catch (e) {
      console.warn("Web Audio API not supported in this browser");
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
    return this.enabled;
  }

  startBackgroundMusic() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    if (this.musicInterval) return; // Already playing

    const playNote = (freq, startTime, duration, volume) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.5); // Slow attack
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Slow decay
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Progression of ambient chords (D minor, F major, C major, G major)
    const progressions = [
      [146.83, 220.00, 293.66, 349.23], // Dm (D3, A3, D4, F4)
      [174.61, 261.63, 349.23, 440.00], // F (F3, C4, F4, A4)
      [130.81, 196.00, 261.63, 329.63], // C (C3, G3, C4, E4)
      [196.00, 293.66, 392.00, 493.88]  // G (G3, D4, G4, B4)
    ];

    let chordIndex = 0;
    
    const playNextChord = () => {
      if (!this.enabled) return;
      const now = this.ctx.currentTime;
      const chord = progressions[chordIndex];
      
      chord.forEach((freq, idx) => {
        const delay = idx * 0.15; // slightly arpeggiated
        const volume = idx === 0 ? 0.04 : 0.025; // soft ambient levels
        playNote(freq, now + delay, 8.0, volume);
      });
      
      chordIndex = (chordIndex + 1) % progressions.length;
    };

    playNextChord();
    this.musicInterval = setInterval(playNextChord, 8000);
  }

  stopBackgroundMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  playClickSound(type) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    const now = this.ctx.currentTime;

    if (type === 'move') {
      // Soft pleasant blip
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.13);
    } 
    else if (type === 'select') {
      // Small chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.09);
    } 
    else if (type === 'bell') {
      // Town Bell alarm sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.5);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.6);
      
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(660, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(550, now + 0.45);
      gain2.gain.setValueAtTime(0.15, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.48);
    } 
    else if (type === 'build') {
      // Hammer knock
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.11);
    }
    else if (type === 'spawn') {
      // Flute trumpety chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.36);
    }
    else if (type === 'complete') {
      // Success Fanfare
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.52);
    }
    else if (type === 'hit') {
      // Noise splash for sword attack
      this.playNoiseSlash();
    }
    else if (type === 'arrow') {
      // Bow Twang
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);

      // Noise component (whistle / rush of air)
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
      filter.Q.setValueAtTime(5, now);
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.16);
    }
    else if (type === 'gallop') {
      // Woodblock/hoof clop (double knock: ta-top)
      const playClop = (timeOffset, pitch, vol) => {
        const oscClop = this.ctx.createOscillator();
        const gainClop = this.ctx.createGain();
        oscClop.type = 'triangle';
        oscClop.frequency.setValueAtTime(pitch, now + timeOffset);
        oscClop.frequency.exponentialRampToValueAtTime(pitch - 80, now + timeOffset + 0.05);
        gainClop.gain.setValueAtTime(vol, now + timeOffset);
        gainClop.gain.exponentialRampToValueAtTime(0.005, now + timeOffset + 0.05);
        
        oscClop.connect(gainClop);
        gainClop.connect(this.ctx.destination);
        oscClop.start(now + timeOffset);
        oscClop.stop(now + timeOffset + 0.06);
      };
      
      playClop(0.0, 160, 0.12);
      playClop(0.06, 130, 0.10);
    }
  }

  playHarvestSound(resourceType) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    const now = this.ctx.currentTime;

    if (resourceType === 'wood') {
      // Chop chop wood knock
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.09);
    } 
    else if (resourceType === 'gold') {
      // High pitch metallic ting
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.linearRampToValueAtTime(2200, now + 0.06);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    } 
    else if (resourceType === 'stone') {
      // Heavy dull rock knock
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.13);
    }
  }

  playNoiseSlash() {
    // Generate a quick white noise burst for sword swing
    const bufferSize = this.ctx.sampleRate * 0.12; // 0.12 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill with random noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    // Low pass filter to make it sound swooshy
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, this.ctx.currentTime);
    filter.Q.setValueAtTime(1, this.ctx.currentTime);
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    noiseNode.start();
  }

  playVictoryTheme() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const playTone = (freq, startOffset, duration) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(0.0, now + startOffset);
      gain.gain.linearRampToValueAtTime(0.15, now + startOffset + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + startOffset + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration);
    };

    // Uplifting fanfare
    playTone(261.63, 0.0, 0.2); // C4
    playTone(329.63, 0.15, 0.2); // E4
    playTone(392.00, 0.3, 0.2); // G4
    playTone(523.25, 0.45, 0.4); // C5
    playTone(659.25, 0.7, 0.3); // E5
    playTone(783.99, 0.9, 0.6); // G5
  }

  playDefeatTheme() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const playTone = (freq, startOffset, duration) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(0.0, now + startOffset);
      gain.gain.linearRampToValueAtTime(0.12, now + startOffset + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration);
    };

    // Melancholy descending theme
    playTone(392.00, 0.0, 0.35); // G4
    playTone(369.99, 0.3, 0.35); // F#4
    playTone(349.23, 0.6, 0.35); // F4
    playTone(293.66, 0.9, 0.75); // D4
  }
}
