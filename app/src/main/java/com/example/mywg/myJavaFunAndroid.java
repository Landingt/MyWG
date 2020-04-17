package com.example.mywg;

import android.webkit.JavascriptInterface;

public class myJavaFunAndroid {


    private JsBridge jsBridge;
    public myJavaFunAndroid(JsBridge jsBridge) {
        this.jsBridge = jsBridge;
    }
   
    @JavascriptInterface
    public void OpenLocalUrl(String s){
        jsBridge.setUrl(s);
    }
}
