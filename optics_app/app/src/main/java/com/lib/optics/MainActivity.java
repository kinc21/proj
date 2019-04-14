package com.lib.optics;

import com.lib.optics.Animation.Animation_Activity;
import com.lib.optics.Exercise_1.Ex1_Activity;
import com.lib.optics.Exercise_2.Ex2_Activity;
import com.lib.optics.Optics_Knowledge.Knowledge_Activity;
import com.lib.optics.R;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.*;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        //Find view that shows Hindi Category
        LinearLayout hindi = (LinearLayout) findViewById(R.id.hindi_text_view);

        //set a clickListener on that view
        hindi.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View view) {

                //Creates new Intent to open {@link Knowledge_Activity}
                Intent hindiIntent = new Intent(MainActivity.this, Knowledge_Activity.class);

                //Start the new Activity
                startActivity(hindiIntent);

            }
        });

        //Find view that shows Gujarati Category
        LinearLayout gujarati = (LinearLayout) findViewById(R.id.gujarati_text_view);

        //set a clickListener on that view
        gujarati.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View view) {

                //Creates new Intent to open {@link Animation_Activity}
                Intent gujaratiIntent = new Intent(MainActivity.this, Animation_Activity.class);

                //Start the new Activity
                startActivity(gujaratiIntent);

            }
        });

        //Find view that shows Marathi Category
        LinearLayout marathi = (LinearLayout) findViewById(R.id.marathi_text_view);

        //set a clickListener on that view
        marathi.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View view) {

                //Creates new Intent to open {@link Ex1_Activity}
                Intent marathiIntent = new Intent(MainActivity.this, Ex1_Activity.class);

                //Start the new Activity
                startActivity(marathiIntent);

            }
        });

        //Find view that shows Hindi Category
        LinearLayout french = (LinearLayout) findViewById(R.id.french_text_view);

        //set a clickListener on that view
        french.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View view) {

                //Creates new Intent to open {@link Knowledge_Activity}
                Intent frenchIntent = new Intent(MainActivity.this, Ex2_Activity.class);

                //Start the new Activity
                startActivity(frenchIntent);

            }
        });

    }

}
