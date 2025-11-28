package com.wealthsutra.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        webView = findViewById(R.id.webView)
        
        // Configure WebView settings
        val webSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true
        webSettings.allowFileAccessFromFileURLs = true
        webSettings.allowUniversalAccessFromFileURLs = true
        webSettings.loadWithOverviewMode = true
        webSettings.useWideViewPort = true
        webSettings.setSupportZoom(true)
        webSettings.builtInZoomControls = false
        webSettings.displayZoomControls = false
        webSettings.cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
        webSettings.mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        
        // Enable debugging (remove in production)
        WebView.setWebContentsDebuggingEnabled(true)
        
        // Add JavaScript interface
        webView.addJavascriptInterface(AndroidInterface(this, webView), "AndroidInterface")
        
        // Set WebViewClient to handle page navigation and errors
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                // Load URLs within WebView
                android.util.Log.d("WebView", "Loading URL: $url")
                return false
            }
            
            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                super.onPageStarted(view, url, favicon)
                android.util.Log.d("WebView", "Page started loading: $url")
            }
            
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                android.util.Log.d("WebView", "Page finished loading: $url")
            }
            
            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                super.onReceivedError(view, errorCode, description, failingUrl)
                android.util.Log.e("WebView", "Error loading: $failingUrl - Code: $errorCode - $description")
                // Show error in WebView
                view?.loadData(
                    """
                    <html>
                    <body style="font-family: Arial; padding: 20px; text-align: center;">
                        <h2>Unable to Load Page</h2>
                        <p>Error: $description</p>
                        <p>URL: $failingUrl</p>
                        <p>Error Code: $errorCode</p>
                        <p>Make sure your server is running on port 3000</p>
                    </body>
                    </html>
                    """.trimIndent(),
                    "text/html",
                    "UTF-8"
                )
            }
        }
        
        // Set WebChromeClient for better debugging and progress tracking
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                android.util.Log.d("WebView", "${consoleMessage?.message()} -- From line ${consoleMessage?.lineNumber()} of ${consoleMessage?.sourceId()}")
                return true
            }
            
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                android.util.Log.d("WebView", "Loading progress: $newProgress%")
            }
        }
        
        // Load the frontend URL
        // For Android Emulator: Use 10.0.2.2 which maps to host machine's localhost
        // For Physical Device: Use your computer's IP address (e.g., http://192.168.1.100:3000)
        //   Find your IP: Windows: ipconfig | findstr IPv4
        //                  Mac/Linux: ifconfig or ip addr
        // For production: Replace with your deployed frontend URL
        val frontendUrl = "https://8611837be0f4.ngrok-free.app/"  // Emulator - maps to host's localhost:3000
        // val frontendUrl = "http://YOUR_COMPUTER_IP:3000"  // Physical device - replace YOUR_COMPUTER_IP
        
        android.util.Log.d("WebView", "Attempting to load URL: $frontendUrl")
        webView.loadUrl(frontendUrl)
    }
    
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}

