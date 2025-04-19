import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.natdorshimer.transVoiceTrainer',
  appName: 'Trans Voice Trainer',
  webDir: 'out',
  android: {
    allowMixedContent: true,
  },
  server: {
    cleartext: true,
    hostname: "localhost",
    androidScheme: "https",        // <— allow https://localhost on Android
  }
};

export default config;
