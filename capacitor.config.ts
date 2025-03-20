import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.travelplan.app',
  appName: 'Travel Plan Facilitation',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#3880ff"
    },
    App: {
      backgroundMode: true
    },
    // Include Fingerprint AIO settings
    "FingerprintAIO": {
      "disableBackup": false,
      "confirmationRequired": true
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
