# Quick Setup Guide

## First Time Setup

1. **Open in Android Studio**
   - File → Open → Select `apps/android` folder
   - Android Studio will automatically sync Gradle

2. **Configure Frontend URL**
   - Open `app/src/main/java/com/wealthsutra/app/MainActivity.kt`
   - Update line with `frontendUrl`:
     ```kotlin
     // For local development (use your computer's IP)
     val frontendUrl = "http://192.168.1.100:5173"
     
     // Or for production
     val frontendUrl = "https://your-production-url.com"
     ```

3. **Run the App**
   - Connect Android device or start emulator
   - Click Run button (green play icon) or press `Shift+F10`

## Development Workflow

1. **Start Backend** (Terminal 1):
   ```bash
   cd apps/backend
   npm run start:dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd apps/web
   npm run dev
   ```

3. **Find Your Local IP**:
   - Windows: `ipconfig` → Look for IPv4 Address
   - Mac/Linux: `ifconfig` or `ip addr`

4. **Update MainActivity.kt** with your local IP

5. **Run Android App** from Android Studio

## Testing the JavaScript Bridge

Once the app is running:
1. The WebView should load your frontend
2. Click "Simulate week" or "Simulate big repair" buttons
3. These will call `AndroidInterface.requestSimulation()`
4. The Android app will load JSON from assets and inject events

## Building Release APK

```bash
cd apps/android
./gradlew assembleRelease
```

APK will be at: `app/build/outputs/apk/release/app-release.apk`

## Troubleshooting

**WebView shows blank page:**
- Check that frontend dev server is running
- Verify URL in MainActivity.kt matches your server
- Check logcat for errors: `View > Tool Windows > Logcat`

**JavaScript bridge not working:**
- Open Chrome DevTools: `chrome://inspect` → Find your device
- Check console for errors
- Verify `AndroidInterface` is available: `console.log(window.AndroidInterface)`

**Asset files not loading:**
- Ensure files are in `app/src/main/assets/`
- File names must match exactly: `week_history.json`, `big_repair.json`
- Rebuild project after adding assets

