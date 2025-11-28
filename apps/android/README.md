# WealthSutra Android App

Android WebView wrapper for the WealthSutra financial planning application.

## Overview

This Android app provides a native wrapper around the WealthSutra SolidJS frontend, enabling:
- Native Android app experience
- JavaScript bridge for SMS simulation
- Asset-based transaction data injection

## Features

- **WebView Integration**: Loads the WealthSutra frontend in a native Android WebView
- **JavaScript Bridge**: `AndroidInterface.requestSimulation(type)` for triggering simulations
- **Asset-based Data**: Pre-loaded JSON files for week history and big repair scenarios
- **Back Navigation**: Handles back button to navigate within WebView

## Setup

### Prerequisites

- Android Studio (latest version)
- JDK 8 or higher
- Android SDK (API 24+)
- Gradle 8.1+

### Configuration

1. **Frontend URL**: Update the frontend URL in `MainActivity.kt`:
   ```kotlin
   val frontendUrl = "http://localhost:5173"  // Development
   // or
   val frontendUrl = "https://your-production-url.com"  // Production
   ```

2. **Network Security**: For localhost development, the app allows cleartext traffic (configured in `AndroidManifest.xml`). For production, use HTTPS.

### Building

1. Open the project in Android Studio
2. Sync Gradle files
3. Build the project: `Build > Make Project`
4. Run on device/emulator: `Run > Run 'app'`

### Command Line Build

```bash
cd apps/android
./gradlew assembleDebug
```

## Architecture

### MainActivity.kt
- Sets up WebView with JavaScript enabled
- Configures JavaScript bridge
- Handles back navigation

### AndroidInterface.kt
- JavaScript interface exposed to WebView
- `requestSimulation(type)`: Called from JavaScript to trigger simulations
- Loads JSON assets and injects events via `window.handleSmsEvents()`

### Assets
- `week_history.json`: 7 days of transaction history
- `big_repair.json`: Single large expense event

## JavaScript Bridge API

### From JavaScript (WebView) to Android

```javascript
// Request a simulation
AndroidInterface.requestSimulation('week_history');
AndroidInterface.requestSimulation('big_repair');
```

### From Android to JavaScript (WebView)

The Android app calls `window.handleSmsEvents()` with transaction event arrays:

```javascript
window.handleSmsEvents([
  {
    timestamp: "2024-11-29T12:00:00.000Z",
    amount: 1800,
    direction: "debit",
    channel: "UPI",
    merchant: "Bike Repair Shop",
    category: "other",
    source: "mock_sms_demo",
    rawText: "You paid ₹1800.00 to Bike Repair Shop via UPI"
  }
]);
```

## Testing

### Development Setup

1. Start the backend server:
   ```bash
   cd apps/backend
   npm run start:dev
   ```

2. Start the frontend dev server:
   ```bash
   cd apps/web
   npm run dev
   ```

3. Update `MainActivity.kt` with your local IP address:
   ```kotlin
   val frontendUrl = "http://192.168.1.100:5173"  // Your local IP
   ```

4. Run the Android app on device/emulator

### Production Build

1. Build release APK:
   ```bash
   ./gradlew assembleRelease
   ```

2. APK location: `app/build/outputs/apk/release/app-release.apk`

## Troubleshooting

### WebView not loading
- Check internet permissions in `AndroidManifest.xml`
- Verify frontend URL is accessible
- Check Android logcat for errors

### JavaScript bridge not working
- Ensure JavaScript is enabled: `webView.settings.javaScriptEnabled = true`
- Check that `AndroidInterface` is properly added
- Verify method is annotated with `@JavascriptInterface`

### Asset files not found
- Ensure JSON files are in `app/src/main/assets/`
- Check file names match exactly: `week_history.json`, `big_repair.json`

## Project Structure

```
apps/android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/wealthsutra/app/
│   │       │   ├── MainActivity.kt
│   │       │   └── AndroidInterface.kt
│   │       ├── res/
│   │       │   ├── layout/activity_main.xml
│   │       │   └── values/
│   │       └── assets/
│   │           ├── week_history.json
│   │           └── big_repair.json
│   └── build.gradle
├── build.gradle
├── settings.gradle
└── README.md
```

## License

Part of the WealthSutra project.

