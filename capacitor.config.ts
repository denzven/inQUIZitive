import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inquizitive.app',
  appName: 'inQUIZitive',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
