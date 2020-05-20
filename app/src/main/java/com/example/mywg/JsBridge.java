package com.example.mywg;

public interface JsBridge {
    void setUrl(String value);

    void clearAppCache();

    void startVice();

    void openVice();

    void stopVice();

    void richScan();

    void getStatusBarHeight();
}
