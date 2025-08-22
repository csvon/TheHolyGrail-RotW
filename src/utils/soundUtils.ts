// src/utils/soundUtils.ts

let lastSoundTime = 0;
const MIN_SOUND_INTERVAL = 1000; // Prevent sound spam

export function playGrailSound() {
  const now = Date.now();

  // Throttle sound playing to prevent spam
  if (now - lastSoundTime < MIN_SOUND_INTERVAL) {
    return;
  }

  lastSoundTime = now;

  const settings = window.Main.getSettings();

  // Check if sounds are enabled
  if (!settings.enableSounds) return;

  // Get sound path and volume from settings
  const soundPath = settings.customSoundFile || 'assets/ding.mp3';
  const volume = settings.soundVolume ?? 1.0;

  // Send to main process for validation and playing
  window.Main.playGrailSound(soundPath, volume);
}

// Alternative: play specific sound with custom volume
export function playGrailSoundWithOptions(soundPath?: string, volume?: number) {
  const now = Date.now();

  // Throttle sound playing
  if (now - lastSoundTime < MIN_SOUND_INTERVAL) {
    return;
  }

  lastSoundTime = now;

  const settings = window.Main.getSettings();

  if (!settings.enableSounds) return;

  const finalSoundPath = soundPath || settings.customSoundFile || 'assets/ding.mp3';
  const finalVolume = volume ?? settings.soundVolume ?? 1.0;

  window.Main.playGrailSound(finalSoundPath, finalVolume);
}

export function testGrailSound() {

  const settings = window.Main.getSettings();
  const soundPath = settings.customSoundFile || 'assets/ding.mp3';
  const volume = settings.soundVolume ?? 1.0;
  
  // Try to play sound directly in renderer
  try {
    const audio = new Audio();
    audio.volume = Math.max(0, Math.min(1, volume));
    
    // Handle different path formats
    if (soundPath.includes('\\') || soundPath.includes('C:')) {
      // Windows absolute path
      audio.src = soundPath; // Try without file:// prefix first
    } else {
      // Relative path
      audio.src = soundPath;
    }
    
    
    audio.play().then(() => {

    }).catch(error => {
      console.error('DIRECT: Audio play failed:', error);
    });
  } catch (error) {
    console.error('DIRECT: Audio setup failed:', error);
  }
  
  // Also try the IPC approach
  window.Main.playGrailSound(soundPath, volume);
}