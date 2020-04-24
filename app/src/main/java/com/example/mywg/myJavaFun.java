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
    @JavascriptInterface
    public void StartVoice(int value){
        jsBridge.startVice();
    }

    @JavascriptInterface
    public void VoiceOpen(){
        jsBridge.openVice();
    }

    @JavascriptInterface
    public void StopVoice(){
        jsBridge.stopVice();
    }
}
