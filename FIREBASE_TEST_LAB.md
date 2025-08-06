# Firebase Test Lab Setup

This project is configured to use Firebase Test Lab for testing the Android app on real devices in Google's cloud.

## 🎯 What This Gives You

- **Real device testing** on actual Android devices (not emulators)
- **Screenshots and videos** of your app running on different devices
- **Performance metrics** and crash reports
- **Multiple device types** (different screen sizes, Android versions)
- **No local Android SDK required** - everything runs in the cloud

## 🚀 How It Works

1. **Your web app** is wrapped in a native Android container using Capacitor
2. **Cloud Build** builds the Android APK in Google's cloud
3. **Firebase Test Lab** runs the app on real devices and captures results
4. **You get screenshots, videos, and test reports** showing how your app looks

## 📱 Test Devices

The configuration tests on these real devices:

- **Pixel 5** (redfin) - Android 11 - Modern flagship device
- **Pixel 4** (flame) - Android 10 - Recent flagship device  
- **Pixel 3** (blueline) - Android 9 - Older flagship device
- **Pixel 2** (walleye) - Android 8.1 - Legacy device

## 🔧 Setup Instructions

### 1. Enable Firebase Test Lab

```bash
# Enable the Firebase Test Lab API
gcloud services enable testing.googleapis.com

# Enable the Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

### 2. Set Up Cloud Build Trigger

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Create a new trigger for your repository
3. Set it to trigger on push to `main` branch
4. Use the `cloudbuild.yaml` file in this repository

### 3. Run Tests

#### Option A: Automatic (Recommended)
- Push to the `main` branch
- Cloud Build will automatically build and test your app
- Check the Cloud Build console for results

#### Option B: Manual
```bash
# Build and sync the app
npm run cap:build

# Trigger Cloud Build manually
gcloud builds submit --config cloudbuild.yaml .
```

## 📊 Viewing Results

1. Go to [Firebase Test Lab Console](https://console.firebase.google.com/project/_/testlab)
2. Select your project
3. View test results, screenshots, and videos
4. Download detailed reports

## 🎨 What You'll See

- **Screenshots** of your app on each device
- **Videos** of the automated test run
- **Performance metrics** (CPU, memory usage)
- **Crash reports** if any issues occur
- **Device logs** for debugging

## 🔍 Testing Your Safari Rendering Issue

This setup will help you see exactly how your web app renders on:
- **Different screen sizes** (Pixel 2 vs Pixel 5)
- **Different Android versions** (Android 8.1 to 11)
- **Real device hardware** (not emulators)

The screenshots and videos will show you if your Safari rendering issues are:
- Device-specific
- Android version-specific  
- Screen size-specific
- Or universal across all devices

## 🛠️ Troubleshooting

### Build Fails
- Check Cloud Build logs in the Google Cloud Console
- Ensure all environment variables are set correctly
- Verify the Capacitor sync completed successfully

### Tests Fail
- Check Firebase Test Lab console for detailed error reports
- Look at device logs for specific error messages
- Verify your app doesn't crash on startup

### No Results
- Ensure Firebase Test Lab API is enabled
- Check that your Cloud Build trigger is configured correctly
- Verify you have sufficient quota for Firebase Test Lab

## 📈 Next Steps

Once you have the basic setup working, you can:

1. **Add more device types** to test on
2. **Create custom test scripts** for specific user flows
3. **Set up performance benchmarking**
4. **Add iOS testing** (requires Apple Developer account)
5. **Integrate with CI/CD** for automatic testing on every commit 