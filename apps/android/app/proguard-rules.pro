# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep JavaScript interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep AndroidInterface
-keep class com.wealthsutra.app.AndroidInterface { *; }

# Keep MainActivity
-keep class com.wealthsutra.app.MainActivity { *; }

