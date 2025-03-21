import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.travelplan.app',
  appName: 'Travel Plan App',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    },
    App: {
      backgroundMode: true
    },
    // Include Fingerprint AIO settings
    "FingerprintAIO": {
      "disableBackup": false,
      "confirmationRequired": true
    }
  }
};

export default config;
