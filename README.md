# Travel Plan Facilitation App

A mobile application built with Ionic/Angular and Capacitor to facilitate business travel planning and management for companies. This app provides a comprehensive platform for both employees and administrators to manage travel-related activities.

## Features

### Employee Features
- **Dashboard**: Central hub for employees to access all travel-related functions
- **Document Submission**: Upload and manage required travel documents
- **Stay-back Request**: Submit and track requests to extend business trips for personal travel
- **Photo Sharing**: Share travel photos with colleagues and explore popular destinations
- **Team Insights**: View team member profiles, interests, and upcoming trips
- **Support Ticket**: Submit and track support requests for travel issues
- **Mood Board**: Create visual collections of travel destinations and ideas
- **Fingerprint Authentication**: Securely log in using device fingerprint (for employee accounts only)

### Admin Features
- **Dashboard**: Overview of all travel activities and management functions
- **Employee Data Management**: Manage employee travel profiles and permissions
- **Document Management**: Review and approve submitted travel documents
- **Approval Workflow**: Process stay-back requests and other approvals
- **Itinerary Management**: Create and manage travel itineraries
- **Tour Management**: Organize and coordinate group business trips
- **Ticket Management**: Handle support tickets from employees
- **Content Sharing**: Publish announcements and resources for travelers

## Technical Features
- **Offline Support**: Store data offline with Capacitor Storage and Filesystem
- **Authentication**: Secure login and registration system with persistent sessions
- **Biometric Security**: Fingerprint authentication for faster access
- **Responsive Design**: Works on mobile and tablet devices
- **Native Camera Integration**: Take and upload photos directly within the app
- **Hardware Back Button Handling**: Custom back navigation with exit confirmation

## User Credentials

For testing purposes, the following credentials are available:

### Admin User
- **Email**: admin@gmail.com
- **Password**: password
- **Note**: Admin accounts do not support fingerprint authentication

### Employee Users
- **User 1**:
  - **Email**: suraj@gmail.com
  - **Password**: password
  - **Fingerprint**: Supported
- **User 2**:
  - **Email**: 8180012573@gmail.com
  - **Password**: password
  - **Fingerprint**: Supported

## Getting Started

### Prerequisites
- Node.js and npm
- Ionic CLI
- Android Studio (for Android builds)
- Xcode (for iOS builds, Mac only)

### Installation

1. Clone the repository
```bash
git clone https://github.com/surajorg0/Travel-Plan-App.git
cd Travel-Plan-App
```

2. Install dependencies
```bash
npm install
```

3. Run the application in development mode
```bash
ionic serve
```

### Building for Native Platforms

#### Android

1. Build the web assets
```bash
ionic build
```

2. Add the Android platform (if not already added)
```bash
npx cap add android
```

3. Sync the web assets with the Android project
```bash
npx cap sync android
```

4. Open the project in Android Studio
```bash
npx cap open android
```

5. In Android Studio:
   - Go to Build > Build Bundle(s) / APK(s) > Build APK(s)
   - Wait for the build to complete
   - Click on the "locate" link in the notification to find the APK
   - Install the APK on your Android device
   - Alternatively, connect your Android device via USB, enable USB debugging, and click Run button in Android Studio

#### iOS (Mac only)
```bash
ionic build
npx cap add ios
npx cap sync ios
npx cap open ios
```

## Feature Details

### Fingerprint Authentication
The app supports fingerprint authentication for employee accounts (not for admin):

1. **First-time setup**: 
   - Log in with your credentials (email and password)
   - Upon successful login, you'll be prompted with "Would you like to enable fingerprint authentication for faster login next time?"
   - Tap "Enable" to activate fingerprint login
   - You'll need to authenticate with your device's fingerprint/biometric sensor

2. **Subsequent logins**:
   - When returning to the app, you'll see a fingerprint icon on the login screen
   - Tap this icon to authenticate with your fingerprint
   - Upon successful authentication, you'll be automatically logged in

3. **Requirements**:
   - Your device must have a working fingerprint sensor
   - You must have set up fingerprint/biometric authentication in your device settings
   - Only employee accounts can use fingerprint authentication

### Logout Functionality
The app provides multiple ways to log out:

1. **Menu Logout**:
   - Open the side menu by tapping the menu icon in the top-left corner
   - Scroll down to find the "Logout" option
   - Tap to log out

2. **Header Logout**:
   - Tap the logout icon in the top-right corner of the app header
   - This provides a quick way to log out from any screen

3. **Confirmation**:
   - When logging out, you'll be asked to confirm to prevent accidental logouts
   - A confirmation dialog with "Cancel" and "Logout" options will appear

## Troubleshooting

### Android Build Issues
- **Login Issues**: If experiencing login problems in Android, ensure you're using the exact credentials provided above.
- **Fingerprint Authentication**: For fingerprint authentication to work:
  1. Your device must have fingerprint capability
  2. You must log in with one of the employee accounts first
  3. Accept the prompt to enable fingerprint login
  4. For subsequent logins, the app will prompt for fingerprint authentication

### Common Issues
- **Plugin Not Found**: Run `npx cap sync` to ensure all plugins are properly installed
- **Android Studio Can't Open Project**: Make sure Android Studio is updated to the latest version
- **Cannot Find Module Errors**: Run `npm install` to ensure all dependencies are installed
- **Fingerprint Not Working**: If fingerprint authentication fails, try logging in with credentials and re-enabling fingerprint login

## Project Structure

- `/src/app/auth`: Authentication components (login, register)
- `/src/app/pages/employee`: Employee-facing feature pages
- `/src/app/pages/admin`: Admin-facing feature pages
- `/src/app/services`: Shared services for data management
- `/src/assets`: Images, icons, and other static assets

## Technology Stack

- **Frontend**: Angular, Ionic Framework, TypeScript
- **Native Features**: Capacitor
- **Storage**: Capacitor Storage, Filesystem
- **UI Components**: Ionic Components
- **Icons**: Ionicons
- **Biometrics**: Cordova Fingerprint AIO Plugin

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Ionic Team for the amazing framework
- Capacitor for the native functionality
- All contributors to this project 