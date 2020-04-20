package com.example.mywg;

import androidx.appcompat.app.AppCompatActivity;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebStorage;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.example.mywg.Utils.CacheUtil;

public class MainActivity extends AppCompatActivity implements JsBridge{
    private long firstTime=0;
    private Handler mHandler;
    private WebView webView;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        setStatusBar();
        inti();


    }

    private void inti() {

        mHandler=new Handler();
        webView=findViewById(R.id.web);

        WebSettings webSettings = webView.getSettings();

        webSettings.setRenderPriority(WebSettings.RenderPriority.HIGH);  //提高渲染的优先级

        webSettings.setJavaScriptCanOpenWindowsAutomatically(true); //支持通过JS打开新窗口
        webView.setWebViewClient(new WebViewClient());
        webView.getSettings().setJavaScriptEnabled(true);//允许webview加载js代码
        webView.addJavascriptInterface(new myJavaFun(this),"myJavaFun");//给webView添加JS接口
        webView.loadUrl("file:///android_asset/login.html");
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);//让JavaScript自动打开窗口，默认false。适用于JavaScript方法window.open()。
        webView.getSettings().setUserAgentString(webView.getSettings().getUserAgentString());
        webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAppCacheEnabled(true);//设置Application缓存API是否开启，默认false，设置有效的缓存路径参考setAppCachePath(String path)方法
        webView.getSettings().setDomStorageEnabled(true); //启用或禁用DOM缓存。
        webView.getSettings().setDatabaseEnabled(true);//启用或禁用DOM缓存。
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
            long secondTime=System.currentTimeMillis();
            if(secondTime-firstTime>2000){
                Toast.makeText(MainActivity.this,"再按一次退出程序",Toast.LENGTH_SHORT).show();
                firstTime=secondTime;
                return true;
            }else{
                System.exit(0);
            }
                return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    public void setUrl(String value) {
        Log.e("JsInterfaceTwo","value="+value);
        mHandler.post(new Runnable() {
            @Override
            public void run() {
                webView.loadUrl("file:///android_asset/login.html#clean");
            }
        });
    }

    @Override
    public void clearAppCache() {

        mHandler.post(new Runnable() {
            @Override
            public void run() {
                Boolean isClear=false;
                try {
                    CacheUtil.getTotalCacheSize(getApplicationContext());
                    isClear=CacheUtil.clearAllCache(getApplicationContext());
                } catch (Exception e) {
                    e.printStackTrace();
                }
                if(isClear){
                    webView.loadUrl("javascript:AppCacheClearCallback('true');");
                }else {
                    webView.loadUrl("javascript:AppCacheClearCallback('false');");
                }

            }
        });
    }
}
