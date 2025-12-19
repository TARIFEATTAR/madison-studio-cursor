/**
 * useCameraFeedback Hook
 * 
 * Professional camera capture feedback system inspired by
 * Hasselblad, Canon Pro, and Apple Pro Apps.
 * 
 * Provides:
 * - Precise mechanical shutter sound (with synthesized fallback)
 * - Sensor acknowledgment flash
 * - Tactile, restrained feedback
 * 
 * Design Rules:
 * - Feedback should feel tactile, not decorative
 * - If the effect draws attention to itself, reduce it
 * - Precision over flair
 * - Calm confidence
 */

import React, { useCallback, useRef, useEffect, useState, useMemo, createElement } from "react";

// ============================================================================
// CONSTANTS - Adjustable timing and intensity
// ============================================================================

export const CAMERA_FEEDBACK_CONFIG = {
  // Shutter Sound
  sound: {
    /** Path to shutter sound file */
    src: "/sounds/shutter.mp3",
    /** Volume level (0.0 - 1.0) - subtle */
    volume: 0.7,
    /** Expected duration in ms (for reference) */
    duration: 100,
    /** Use synthesized sound as fallback */
    useSynthFallback: true,
  },
  
  // Flash Effect
  flash: {
    /** Delay after sound trigger (ms) */
    delay: 0,
    /** Total flash duration (ms) */
    duration: 120,
    /** Peak opacity (0.0 - 1.0) - subtle */
    peakOpacity: 0.35,
    /** Fade out duration (ms) */
    fadeOut: 100,
  },
  
  // Sequencing
  timing: {
    /** Minimum time between triggers (debounce) */
    debounceMs: 300,
  },
} as const;

// ============================================================================
// SYNTHESIZED SHUTTER SOUND - Web Audio API fallback
// Creates a convincing digital camera shutter click
// ============================================================================

function createSynthShutterSound(audioContext: AudioContext, volume: number = 0.5): void {
  const now = audioContext.currentTime;
  
  // Master gain
  const masterGain = audioContext.createGain();
  masterGain.connect(audioContext.destination);
  masterGain.gain.setValueAtTime(volume, now);
  
  // === PART 1: Initial mechanical "click" ===
  // White noise burst for the initial click
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.03, audioContext.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.15));
  }
  
  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  
  // Bandpass filter for click character
  const clickFilter = audioContext.createBiquadFilter();
  clickFilter.type = "bandpass";
  clickFilter.frequency.setValueAtTime(3000, now);
  clickFilter.Q.setValueAtTime(2, now);
  
  const clickGain = audioContext.createGain();
  clickGain.gain.setValueAtTime(0.8, now);
  clickGain.gain.setTargetAtTime(0.001, now, 0.008);
  
  noiseSource.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(masterGain);
  noiseSource.start(now);
  noiseSource.stop(now + 0.03);
  
  // === PART 2: Low "thunk" body resonance ===
  const thunk = audioContext.createOscillator();
  thunk.type = "sine";
  thunk.frequency.setValueAtTime(120, now);
  thunk.frequency.exponentialRampToValueAtTime(60, now + 0.05);
  
  const thunkGain = audioContext.createGain();
  thunkGain.gain.setValueAtTime(0.4, now);
  thunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  
  thunk.connect(thunkGain);
  thunkGain.connect(masterGain);
  thunk.start(now);
  thunk.stop(now + 0.07);
  
  // === PART 3: High frequency "snap" ===
  const snap = audioContext.createOscillator();
  snap.type = "square";
  snap.frequency.setValueAtTime(4500, now);
  
  const snapGain = audioContext.createGain();
  snapGain.gain.setValueAtTime(0.15, now);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
  
  const snapFilter = audioContext.createBiquadFilter();
  snapFilter.type = "highpass";
  snapFilter.frequency.setValueAtTime(2000, now);
  
  snap.connect(snapFilter);
  snapFilter.connect(snapGain);
  snapGain.connect(masterGain);
  snap.start(now);
  snap.stop(now + 0.015);
}

// ============================================================================
// TYPES
// ============================================================================

export interface CameraFeedbackOptions {
  /** Enable/disable sound */
  soundEnabled?: boolean;
  /** Enable/disable flash */
  flashEnabled?: boolean;
  /** Custom sound source */
  soundSrc?: string;
  /** Custom volume (0-1) */
  volume?: number;
  /** Callback after feedback completes */
  onComplete?: () => void;
}

export interface CameraFeedbackReturn {
  /** Trigger the capture feedback */
  trigger: () => void;
  /** Whether feedback is currently playing */
  isPlaying: boolean;
  /** Whether audio has been preloaded */
  isReady: boolean;
  /** Preload audio (call on first user interaction) */
  preload: () => void;
  /** Flash component to render (use as: <FlashOverlay />) */
  FlashOverlay: React.FC;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useCameraFeedback(
  options: CameraFeedbackOptions = {}
): CameraFeedbackReturn {
  const {
    soundEnabled = true,
    flashEnabled = true,
    soundSrc = CAMERA_FEEDBACK_CONFIG.sound.src,
    volume = CAMERA_FEEDBACK_CONFIG.sound.volume,
    onComplete,
  } = options;

  // Refs for audio and state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastTriggerRef = useRef<number>(0);
  const useSynthRef = useRef<boolean>(false);
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  // -------------------------------------------------------------------------
  // Audio Context for Synthesized Sound
  // -------------------------------------------------------------------------
  
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // -------------------------------------------------------------------------
  // Audio Preloading
  // -------------------------------------------------------------------------
  
  const preload = useCallback(() => {
    if (audioRef.current || !soundEnabled) return;

    try {
      const audio = new Audio(soundSrc);
      audio.volume = volume;
      audio.preload = "auto";
      
      // Load the audio
      audio.load();
      
      audio.addEventListener("canplaythrough", () => {
        useSynthRef.current = false;
        setIsReady(true);
      }, { once: true });

      audio.addEventListener("error", () => {
        console.debug("[CameraFeedback] Audio file not found, using synthesized sound");
        useSynthRef.current = true;
        setIsReady(true);
      });

      audioRef.current = audio;
      
      // Set a timeout - if audio doesn't load in 1s, use synth
      setTimeout(() => {
        if (!isReady) {
          useSynthRef.current = true;
          setIsReady(true);
        }
      }, 1000);
    } catch (err) {
      console.debug("[CameraFeedback] Audio initialization failed, using synthesized sound");
      useSynthRef.current = true;
      setIsReady(true);
    }
  }, [soundEnabled, soundSrc, volume, isReady]);

  // Auto-preload on mount (will play on user interaction)
  useEffect(() => {
    // Attempt preload - browsers may block until interaction
    preload();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [preload]);

  // -------------------------------------------------------------------------
  // Play Shutter Sound (file or synthesized)
  // -------------------------------------------------------------------------
  
  const playSound = useCallback(async () => {
    if (!soundEnabled) {
      console.debug("[CameraFeedback] Sound disabled");
      return;
    }

    console.log("[CameraFeedback] Playing shutter sound...");

    // Use synthesized sound if file didn't load
    if (useSynthRef.current || CAMERA_FEEDBACK_CONFIG.sound.useSynthFallback) {
      try {
        const ctx = getAudioContext();
        console.log("[CameraFeedback] Audio context state:", ctx.state);
        
        // Ensure audio context is running (required by browsers)
        if (ctx.state === "suspended") {
          console.log("[CameraFeedback] Resuming suspended audio context...");
          await ctx.resume();
          console.log("[CameraFeedback] Audio context state after resume:", ctx.state);
        }
        
        // Double-check state after resume
        if (ctx.state === "running") {
          console.log("[CameraFeedback] Creating synthesized shutter sound");
          createSynthShutterSound(ctx, volume);
        } else {
          console.warn("[CameraFeedback] Audio context not running:", ctx.state);
        }
        return;
      } catch (err) {
        console.error("[CameraFeedback] Synth sound error:", err);
      }
    }

    // Try to play audio file
    if (audioRef.current) {
      try {
        const audio = audioRef.current;
        audio.currentTime = 0;
        audio.volume = volume;
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(async () => {
            // Fall back to synth if playback fails
            try {
              const ctx = getAudioContext();
              if (ctx.state === "suspended") {
                await ctx.resume();
              }
              if (ctx.state === "running") {
                createSynthShutterSound(ctx, volume);
              }
            } catch (synthErr) {
              console.error("[CameraFeedback] Fallback synth error:", synthErr);
            }
          });
        }
      } catch (err) {
        console.debug("[CameraFeedback] Sound playback error:", err);
      }
    }
  }, [soundEnabled, volume, getAudioContext]);

  // -------------------------------------------------------------------------
  // Trigger Flash Effect
  // -------------------------------------------------------------------------
  
  const triggerFlash = useCallback(() => {
    if (!flashEnabled) {
      console.debug("[CameraFeedback] Flash disabled");
      return;
    }

    console.log("[CameraFeedback] Triggering flash...");
    
    // Start flash after configured delay
    setTimeout(() => {
      console.log("[CameraFeedback] Flash ON");
      setShowFlash(true);
      
      // End flash after duration
      setTimeout(() => {
        console.log("[CameraFeedback] Flash OFF");
        setShowFlash(false);
      }, CAMERA_FEEDBACK_CONFIG.flash.duration);
    }, CAMERA_FEEDBACK_CONFIG.flash.delay);
  }, [flashEnabled]);

  // -------------------------------------------------------------------------
  // Main Trigger Function
  // -------------------------------------------------------------------------
  
  const trigger = useCallback(() => {
    const now = Date.now();
    
    // Debounce rapid triggers
    if (now - lastTriggerRef.current < CAMERA_FEEDBACK_CONFIG.timing.debounceMs) {
      return;
    }
    lastTriggerRef.current = now;

    // Mark as playing
    setIsPlaying(true);

    // 1. Sound → Immediate (fire and forget, but ensure audio context is ready)
    // Initialize audio context if needed (browsers require user interaction)
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume().catch((err) => {
          console.warn("[CameraFeedback] Failed to resume audio context:", err);
        });
      }
    } catch (err) {
      console.warn("[CameraFeedback] Audio context error:", err);
    }
    
    // Play sound (async but we don't wait)
    playSound().catch((err) => {
      console.warn("[CameraFeedback] Sound playback failed:", err);
    });

    // 2. Flash → Starts within delay
    triggerFlash();

    // 3. Complete callback and reset state
    const totalDuration = 
      CAMERA_FEEDBACK_CONFIG.flash.delay + 
      CAMERA_FEEDBACK_CONFIG.flash.duration + 
      CAMERA_FEEDBACK_CONFIG.flash.fadeOut;

    setTimeout(() => {
      setIsPlaying(false);
      onComplete?.();
    }, totalDuration);
  }, [playSound, triggerFlash, onComplete]);

  // -------------------------------------------------------------------------
  // Flash Overlay Component (must be a component to react to state changes)
  // -------------------------------------------------------------------------
  
  // Create a component that reacts to showFlash state changes
  // Using useMemo to create a stable component reference that updates when showFlash changes
  const FlashOverlayComponent = useMemo(() => {
    const Component: React.FC = () => {
      if (!flashEnabled) return null;
      
      return createElement("div", {
        key: "camera-flash-overlay",
        className: `camera-flash-overlay ${showFlash ? "camera-flash-overlay--active" : ""}`,
        "aria-hidden": "true",
      });
    };
    Component.displayName = "CameraFlashOverlay";
    return Component;
  }, [flashEnabled, showFlash]);

  return {
    trigger,
    isPlaying,
    isReady,
    preload,
    FlashOverlay: FlashOverlayComponent,
  };
}

// ============================================================================
// STANDALONE UTILITY (for non-hook usage)
// ============================================================================

export class CameraFeedback {
  private audio: HTMLAudioElement | null = null;
  private isReady = false;
  private lastTrigger = 0;
  private flashElement: HTMLDivElement | null = null;

  constructor(private config = CAMERA_FEEDBACK_CONFIG) {}

  /**
   * Preload audio - call on first user interaction
   */
  preload(): Promise<void> {
    return new Promise((resolve) => {
      if (this.audio) {
        resolve();
        return;
      }

      try {
        this.audio = new Audio(this.config.sound.src);
        this.audio.volume = this.config.sound.volume;
        this.audio.preload = "auto";
        
        this.audio.addEventListener("canplaythrough", () => {
          this.isReady = true;
          resolve();
        }, { once: true });

        this.audio.addEventListener("error", () => {
          this.isReady = true;
          resolve();
        }, { once: true });

        this.audio.load();
      } catch {
        this.isReady = true;
        resolve();
      }
    });
  }

  /**
   * Create and inject flash overlay element
   */
  private createFlashElement(): HTMLDivElement {
    if (this.flashElement) return this.flashElement;

    const el = document.createElement("div");
    el.className = "camera-flash-overlay";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    this.flashElement = el;
    return el;
  }

  /**
   * Play shutter sound
   */
  private playSound(): void {
    if (!this.audio) return;

    try {
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
    } catch {
      // Ignore playback errors
    }
  }

  /**
   * Trigger flash effect
   */
  private triggerFlash(): void {
    const flash = this.createFlashElement();

    setTimeout(() => {
      flash.classList.add("camera-flash-overlay--active");

      setTimeout(() => {
        flash.classList.remove("camera-flash-overlay--active");
      }, this.config.flash.duration);
    }, this.config.flash.delay);
  }

  /**
   * Trigger full capture feedback
   */
  trigger(): void {
    const now = Date.now();
    if (now - this.lastTrigger < this.config.timing.debounceMs) return;
    this.lastTrigger = now;

    this.playSound();
    this.triggerFlash();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    if (this.flashElement) {
      this.flashElement.remove();
      this.flashElement = null;
    }
  }
}

export default useCameraFeedback;






