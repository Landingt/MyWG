package com.example.mywg;

import androidx.appcompat.app.AppCompatActivity;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;

import static java.lang.Math.log;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        setStatusBar();
        webView=findViewById(R.id.web);

        WebSettings webSettings = webView.getSettings();

        webSettings.setRenderPriority(WebSettings.RenderPriority.HIGH);  //提高渲染的优先级

        webSettings.setJavaScriptCanOpenWindowsAutomatically(true); //支持通过JS打开新窗口
        webView.setWebViewClient(new WebViewClient());
        webView.getSettings().setJavaScriptEnabled(true);//允许webview加载js代码
        webView.addJavascriptInterface(new JsInterface(),"Launcher");//给webview添加Js接口
        webView.loadUrl("file:///android_asset/login.html");
        webView.setWebViewClient(new WebViewClient(){
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                exeJsCode(view,readAssetsJsFile("Scripts/jquery-1.10.1.min.js"));
            }
        });
        webView.getSettings().setUserAgentString(webView.getSettings().getUserAgentString());
        webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAppCacheEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);

    }

    private void exeJsCode(WebView view, String readAssetsJsFile) {
        if(TextUtils.isEmpty(readAssetsJsFile)){
            return;
        }
        String exeJsStr="javascript"+readAssetsJsFile;
        if(Build.VERSION.SDK_INT>Build.VERSION_CODES.KITKAT){
            view.evaluateJavascript(readAssetsJsFile, new ValueCallback<String>() {
                @Override
                public void onReceiveValue(String value) {

                }
            });
        }else {
            view.loadUrl(exeJsStr);
        }
    }

    private String readAssetsJsFile(String path) {
        String jsStr="";
        InputStream in= null;
        try {
            in = getAssets().open(path);

        byte buff[]=new byte[1024];
        ByteArrayOutputStream fromFile=new ByteArrayOutputStream();
        do {
            int numRaed=in.read(buff);
            if(numRaed<=0){
                break;
            }
            fromFile.write(buff,0,numRaed);
        }while (true);
        jsStr=fromFile.toString();
        in.close();
        fromFile.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
        return jsStr;
    }

    void setStatusBar() {
        if (Build.VERSION.SDK_INT >= 21) {
            View decorView = getWindow().getDecorView();
            int option = View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE;
            decorView.setSystemUiVisibility(option);
            getWindow().setNavigationBarColor(Color.TRANSPARENT);
            getWindow().setStatusBarColor(Color.TRANSPARENT);
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if(keyCode == KeyEvent.KEYCODE_BACK&&webView.canGoBack()){

                webView.goBack();
                return true;


        }
        return super.onKeyDown(keyCode, event);
    }

}
