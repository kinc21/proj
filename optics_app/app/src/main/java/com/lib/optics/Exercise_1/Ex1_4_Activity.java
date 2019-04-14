package com.lib.optics.Exercise_1;

import com.lib.optics.R;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

public class Ex1_4_Activity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.words_list);

        setContentView(R.layout.activity_category);
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.container, new Ex1_4_Fragment())
                .commit();
    }
}
