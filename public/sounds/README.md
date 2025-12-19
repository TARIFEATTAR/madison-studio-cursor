# Camera Sounds

This directory contains audio assets for the camera feedback system.

## Required File

### `shutter.mp3`

**Specifications:**
- **Type:** Modern mechanical shutter click
- **Duration:** 80-120ms
- **Format:** MP3 (or WAV/OGG for broader compatibility)
- **Sample Rate:** 44.1kHz or 48kHz
- **Bit Depth:** 16-bit minimum
- **Channels:** Mono or Stereo

**Sound Characteristics:**
- Single, short, precise click
- Modern/digital camera feel (not vintage)
- No reverb, echo, or delay
- Clean attack, minimal sustain
- Similar to: Hasselblad X2D, Canon R5, Sony α1

**Recommended Sources:**
1. [Freesound.org](https://freesound.org/search/?q=camera+shutter+digital) - Free CC0 sounds
2. [Zapsplat](https://www.zapsplat.com/sound-effect-category/camera/) - Royalty-free
3. Record your own from a modern mirrorless camera

**Example Search Terms:**
- "digital camera shutter"
- "mirrorless camera click"
- "modern shutter sound short"

## Usage

The sound is loaded by `useCameraFeedback` hook:

```typescript
import { useCameraFeedback } from '@/hooks/useCameraFeedback';

function CaptureButton() {
  const { trigger, preload, FlashOverlay } = useCameraFeedback();
  
  // Preload on first interaction
  const handleFirstInteraction = () => preload();
  
  // Trigger on capture
  const handleCapture = () => trigger();
  
  return (
    <>
      <button onClick={handleCapture}>Capture</button>
      <FlashOverlay />
    </>
  );
}
```

## Fallback Behavior

If the sound file is missing or fails to load:
- The hook will still function
- Flash effect will still trigger
- No errors will be thrown
- A console warning will be logged






