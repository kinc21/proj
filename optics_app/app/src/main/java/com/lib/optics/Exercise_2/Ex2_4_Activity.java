package com.lib.optics.Exercise_2;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;

import com.lib.optics.R;

/**
 * Created by lenovo on 16-12-2017.
 */

public class Ex2_4_Activity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.words_list);

        setContentView(R.layout.activity_category);
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.container, new Ex2_4_Fragment())
                .commit();
    }
}
