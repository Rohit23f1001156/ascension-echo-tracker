
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a836e1234c484d05be82b180494ec0e4',
  appName: 'ascension-echo-tracker',
  webDir: 'dist',
  server: {
    url: 'https://a836e123-4c48-4d05-be82-b180494ec0e4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
