package com.example.mywg;

import android.util.Log;
import android.webkit.JavascriptInterface;

public class myJavaFun {


    private JsBridge jsBridge;
    public myJavaFun(JsBridge jsBridge) {
        this.jsBridge = jsBridge;
    }
   
    @JavascriptInterface
    public void OpenLocalUrl(String s){
        Log.e("JsInterface","value="+s);
        jsBridge.setUrl(s);
    }
    @JavascriptInterface
    public void AppCacheClear(){
        jsBridge.clearAppCache();
    }
}
