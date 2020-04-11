package com.example.mywg;

import android.util.Log;
import android.webkit.JavascriptInterface;

public class JsInterface {
    private static final String TAG="JsInterface";
    @JavascriptInterface
    public void setValue(String value){
        Log.d(TAG,"value="+value);
    }
}
