// Spanish TTS with failover to browser Web Speech API
export interface VoiceOption {
  id: string;
  name: string;
  tone: string;
  gender: 'male' | 'female';
  geminiVoice: string;
}

export const SPANISH_VOICES: VoiceOption[] = [
  {
    id: '35b2cfc1-e6fb-4d69-a598-c1780612be4a',
    name: 'Darío',
    tone: 'Seguro, sereno y claro',
    gender: 'male',
    geminiVoice: 'Puck',
  },
  {
    id: 'a7beff01-8f8b-4809-bfe6-e2166e57e0c2',
    name: 'Iria',
    tone: 'Didáctica, paciente y entusiasta',
    gender: 'female',
    geminiVoice: 'Aoede',
  },
  {
    id: 'ad38904c-0ce9-42b1-9159-5ad5352ef089',
    name: 'Celia',
    tone: 'Clara, dulce y analítica',
    gender: 'female',
    geminiVoice: 'Kore',
  },
];

function normalizeSpeechText(text: string): string {
  return text
    .replace(/90°/g, 'noventa grados')
    .replace(/(\d+)°/g, '$1 grados')
    .replace(/\b3D\b/gi, 'tres de')
    .replace(/\b3\.º\b/gi, 'tercero')
    .replace(/(\d+)\s*[x×*]\s*(\d+)/gi, '$1 por $2')
    .replace(/(\d+)\s*=\s*(\d+)/g, '$1 es igual a $2');
}

class SpeechNarrator {
  private isEnabled: boolean = true;
  private currentAudio: HTMLAudioElement | null = null;
  private currentVoiceId: string = '35b2cfc1-e6fb-4d69-a598-c1780612be4a';
  private audioCache: Map<string, string> = new Map();
  private abortController: AbortController | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.updateVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.updateVoices();
      };
    }
  }

  private updateVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setVoice(voiceId: string) {
    this.currentVoiceId = voiceId;
  }

  public getVoice(): string {
    return this.currentVoiceId;
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  private speakWithBrowser(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.stop();

    const utterance = new SpeechSynthesisUtterance(normalizeSpeechText(text));
    utterance.lang = 'es-ES';
    utterance.rate = 0.95; // Friendly cadence for 8yo
    utterance.pitch = 1.05;

    const spanishVoices = this.availableVoices.filter(
      (v) => v.lang.toLowerCase().startsWith('es') || v.lang.includes('ES')
    );
    if (spanishVoices.length > 0) {
      utterance.voice = spanishVoices[0];
    }

    window.speechSynthesis.speak(utterance);
  }

  public async speak(text: string): Promise<void> {
    if (!this.isEnabled || !text.trim()) return;

    this.stop();

    const cacheKey = `${this.currentVoiceId}:${text.trim()}`;
    if (this.audioCache.has(cacheKey)) {
      const audioUrl = this.audioCache.get(cacheKey)!;
      try {
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;
        await audio.play();
        return;
      } catch {
        // Fallback to browser synthesis
      }
    }

    try {
      this.abortController = new AbortController();
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: this.currentVoiceId,
          engine: 'auto',
        }),
        signal: this.abortController.signal,
      });

      if (!res.ok) {
        throw new Error('TTS server fallback');
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      this.audioCache.set(cacheKey, audioUrl);

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      await audio.play();
    } catch {
      // Graceful fallback to native browser Web Speech API
      this.speakWithBrowser(text);
    }
  }
}

export const narrator = new SpeechNarrator();
