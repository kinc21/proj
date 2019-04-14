package com.lib.optics.Animation;

import com.lib.optics.R;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;


public class Animation_EyeActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //setContentView(R.layout.words_list);
        setContentView(R.layout.reflection_page);
        WebView mWebView;
        mWebView = (WebView) findViewById(R.id.reflection_webview);

        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        mWebView.setWebViewClient(new WebViewClient()
        {
            public void onLoadResource(WebView view, String url){
                view.reload();
            }



        });

        mWebView.loadUrl("file:///android_asset/eyeball.html");
        //mWebView.loadUrl("https://yahoo.com.hk");


    }
}
