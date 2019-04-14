package com.lib.optics.Animation;


import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.lib.optics.R;


/**
 * A simple {@link Fragment} subclass.
 */
public class Animation_HuyFragment extends Fragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.reflection_page, container,false);
		WebView mWebView;
        mWebView = (WebView) rootView.findViewById(R.id.reflection_webview);

        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
		mWebView.setWebViewClient(new WebViewClient()
        {
            public void onLoadResource(WebView view, String url){
                view.reload();
            }



        });
        mWebView.loadUrl("file:///android_asset/huygens.html");
        //mWebView.loadUrl("https://yahoo.com.hk");
        return rootView;
    }

}
