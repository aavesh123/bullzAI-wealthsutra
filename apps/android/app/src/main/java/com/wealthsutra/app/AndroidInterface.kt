package com.wealthsutra.app

import android.content.Context
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

/**
 * JavaScript interface for communication between WebView and Android app
 * Provides requestSimulation method that can be called from JavaScript
 */
class AndroidInterface(private val context: Context, private val webView: WebView) {
    
    companion object {
        private const val TAG = "AndroidInterface"
    }
    
    /**
     * Called from JavaScript: AndroidInterface.requestSimulation(type)
     * @param type Either "week_history" or "big_repair"
     */
    @JavascriptInterface
    fun requestSimulation(type: String) {
        Log.d(TAG, "requestSimulation called with type: $type")
        
        try {
            val jsonData = when (type) {
                "week_history" -> loadAsset("week_history.json")
                "big_repair" -> loadAsset("big_repair.json")
                else -> {
                    Log.e(TAG, "Unknown simulation type: $type")
                    return
                }
            }
            
            if (jsonData != null) {
                // Parse JSON and call handleSmsEvents in WebView
                val events = parseJsonToEvents(jsonData)
                injectSmsEvents(events)
            } else {
                Log.e(TAG, "Failed to load asset for type: $type")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in requestSimulation", e)
        }
    }
    
    /**
     * Load JSON file from assets folder
     */
    private fun loadAsset(filename: String): String? {
        return try {
            val inputStream = context.assets.open(filename)
            val size = inputStream.available()
            val buffer = ByteArray(size)
            inputStream.read(buffer)
            inputStream.close()
            String(buffer, Charsets.UTF_8)
        } catch (e: IOException) {
            Log.e(TAG, "Error loading asset: $filename", e)
            null
        }
    }
    
    /**
     * Parse JSON string to array of transaction events
     */
    private fun parseJsonToEvents(jsonString: String): JSONArray {
        return try {
            JSONArray(jsonString)
        } catch (e: Exception) {
            // If not an array, try as object with events property
            try {
                val jsonObject = JSONObject(jsonString)
                if (jsonObject.has("events")) {
                    jsonObject.getJSONArray("events")
                } else {
                    JSONArray().put(jsonObject)
                }
            } catch (e2: Exception) {
                Log.e(TAG, "Error parsing JSON", e2)
                JSONArray()
            }
        }
    }
    
    /**
     * Inject SMS events into WebView by calling window.handleSmsEvents
     */
    private fun injectSmsEvents(events: JSONArray) {
        // Run on UI thread to access WebView
        (context as? android.app.Activity)?.runOnUiThread {
            // Convert JSONArray to JavaScript array string
            val eventsJson = events.toString()
            
            // Call handleSmsEvents function in WebView
            val jsCode = """
                (function() {
                    if (window.handleSmsEvents) {
                        try {
                            var events = $eventsJson;
                            window.handleSmsEvents(events);
                        } catch (e) {
                            console.error('Error calling handleSmsEvents:', e);
                        }
                    } else {
                        console.warn('handleSmsEvents not found in window');
                    }
                })();
            """.trimIndent()
            
            webView.evaluateJavascript(jsCode, null)
            Log.d(TAG, "Injected SMS events into WebView")
        }
    }
}

